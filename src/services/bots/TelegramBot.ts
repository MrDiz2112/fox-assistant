import { Telegraf } from "telegraf";
import i18next from "i18next";
import { message } from "telegraf/filters";
import BaseBot from "./BaseBot";
import { ICompletionHandler } from "../../interfaces/ICompletionHandler";
import { CompletionHandlerContext } from "../../domain/CompletionHandlerContext";
import Logger from "../../core/Logger";

const logger = Logger.getLogger("TelegramBot");

export default class TelegramBot extends BaseBot {
    private static TOKEN = process.env.TELEGRAM_TOKEN!;

    // TODO context
    bot: Telegraf = new Telegraf(TelegramBot.TOKEN);

    constructor(completionHandler: ICompletionHandler) {
        super(completionHandler);

        process.once("SIGINT", () => this.bot.stop("SIGINT"));
        process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
    }

    public handleMessageText() {
        this.bot.on(message("text"), async (ctx) => {
            const context = this.getContext(ctx);

            let completion = await this.completionHandler
                .handleMessageText(context)
                .catch((err) => {
                    logger.error(err);
                });

            if (completion == null) {
                logger.error(
                    `Telegram Chat ${context.chatId} user ${context.username} completion error`
                );
                completion = i18next.t("completionError") as string;
            }

            await ctx
                .replyWithMarkdownV2(
                    completion.replace(/([|{\[\]*_~}+)(#>!=\-.])/gm, "\\$1")
                )
                .catch((err) => {
                    // logger.error(`Chat ${chatId} user ${user} reply error`);
                    logger.error(err);
                });
        });
    }

    public handleCommandStart() {
        this.bot.start((ctx) => {
            const context = this.getContext(ctx);

            let greeting = this.completionHandler.handleCommandStart(context);

            ctx.reply(greeting);
        });
    }

    public handleCommandHistory() {
        this.bot.command("history", (ctx) => {
            const context = this.getContext(ctx);

            const history =
                this.completionHandler.handleCommandHistory(context);

            ctx.reply(history);
        });
    }

    public handleCommandClear() {
        this.bot.command("clear", (ctx) => {
            const context = this.getContext(ctx);

            let message = this.completionHandler.handleCommandClear(context);

            ctx.reply(message);
        });
    }

    public launch(): Promise<void> {
        logger.info("Telegram bot launched");
        return this.bot.launch();
    }

    private getContext(ctx: any): CompletionHandlerContext {
        return {
            chatId: ctx?.chat?.id,
            chatType: ctx?.chat?.type === "private" ? "user" : "group",
            messageText: ctx?.message?.text,
            username: ctx?.from?.username!,
        };
    }
}
