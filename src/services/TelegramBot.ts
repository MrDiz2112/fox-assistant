import { Telegraf } from "telegraf";
import i18next from "i18next";
import { message } from "telegraf/filters";
import logger from "../core/logger";
import { ICompletionClientFactory } from "../interfaces/ICompletionClientFactory";
import BaseBot from "./BaseBot";
import { IBot } from "../interfaces/IBot";

export default class TelegramBot extends BaseBot implements IBot {
    static TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;

    bot: Telegraf = new Telegraf(TelegramBot.TELEGRAM_TOKEN);

    constructor(completionClientFactory: ICompletionClientFactory) {
        super(completionClientFactory);

        process.once("SIGINT", () => this.bot.stop("SIGINT"));
        process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
    }

    public handleMessageText() {
        this.bot.on(message("text"), async (ctx) => {
            const chatType = ctx.chat.type;
            const messageText = ctx.message.text;

            if (chatType === "group" || chatType === "supergroup") {
                const prefixes = [
                    i18next.t("names.name1").toLowerCase(),
                    i18next.t("names.name2").toLowerCase(),
                ];

                if (
                    !prefixes.some((prefix) =>
                        messageText.toLowerCase().startsWith(prefix)
                    )
                ) {
                    return;
                }
            }

            const chatId = ctx.chat.id;
            const client = this.getUserClient(chatId, chatType);

            const user = ctx.message.from.username;

            logger.info(`Chat ${chatId} user ${user} message: ${messageText}`);

            let completion = await client.completion(messageText, user);

            logger.info(
                `Chat ${chatId} user ${user} completion: ${completion}`
            );

            if (completion == null) {
                logger.error(`Chat ${chatId} user ${user} completion error`);
                completion = i18next.t("completionError") as string;
            }

            await ctx
                .replyWithMarkdownV2(
                    completion.replace(/([|{\[\]*_~}+)(#>!=\-.])/gm, "\\$1")
                )
                .catch((err) => {
                    logger.error(`Chat ${chatId} user ${user} reply error`);
                    logger.error(err);
                });
        });
    }

    public handleCommandGpt() {
        this.bot.command("gtp", (ctx) => {
            ctx.reply("Пока я не умею это делать");
        });
    }

    public handleCommandHistory() {
        this.bot.command("history", (ctx) => {
            const chatId = ctx.chat.id;

            const client = this.getUserClient(chatId, ctx.chat.type);
            const messagesHistory = client.getMessages();

            logger.info(`Chat ${chatId} history requested`);

            const historyFormatted = messagesHistory.map((message) => {
                let name;

                switch (message.role) {
                    case "user":
                        name = ctx.message.from.username;
                        break;
                    case "assistant":
                        name = i18next.t("names.name1");
                        break;
                    case "system":
                        name = i18next.t("names.system");
                        break;
                }

                return `[${name}]: ${message.content}`;
            });

            ctx.reply(historyFormatted.join("\n"));
        });
    }

    public handleCommandClear() {
        this.bot.command("clear", (ctx) => {
            const chatId = ctx.chat.id;

            const client = this.getUserClient(chatId, ctx.chat.type);
            client.clearMessages();

            logger.info(`Chat ${chatId} history cleared`);

            const message = i18next.t("clearHistory");

            ctx.reply(message);
        });
    }

    public handleStart() {
        this.bot.start((ctx) => {
            let greeting;
            const chatType = ctx.chat.type;

            switch (chatType) {
                case "private":
                    greeting = i18next.t("greeting.private");
                    break;
                case "supergroup":
                case "group":
                    greeting = i18next.t("greeting.group");
                    break;
            }

            ctx.reply(greeting);
        });
    }

    public launch(): Promise<void> {
        logger.info("Telegram bot launched");
        return this.bot.launch();
    }
}
