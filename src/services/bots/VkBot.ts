import BaseBot from "./BaseBot";
import { IBot } from "../../interfaces/IBot";
import { ICompletionClientFactory } from "../../interfaces/ICompletionClientFactory";
import { VK } from "vk-io";
import logger from "../../core/logger";
import { HearManager } from "@vk-io/hear";
import i18next from "i18next";

export default class VkBot extends BaseBot implements IBot {
    static VK_TOKEN = process.env.VK_TOKEN!;
    vk: VK = new VK({
        token: VkBot.VK_TOKEN,
    });

    // TODO context
    hearManager = new HearManager();

    constructor(completionClientFactory: ICompletionClientFactory) {
        super(completionClientFactory);

        this.vk.updates.on("message_new", this.hearManager.middleware);
    }
    handleCommandClear(): void {
        this.hearManager.hear(/^\/clear$/i, async (ctx) => {
            const chatId = ctx.peerId!;
            const client = this.getUserClient(chatId, "chat");
            await client.clearMessages();

            const message = i18next.t("clearHistory");

            await ctx.send(message);
        });
    }

    handleCommandGpt(): void {}

    handleCommandHistory(): void {}

    handleMessageText(): void {
        this.vk.updates.on("message_new", async (ctx, next) => {
            if (ctx.peerType === "chat") {
                const prefixes = [
                    i18next.t("names.name1").toLowerCase(),
                    i18next.t("names.name2").toLowerCase(),
                ];

                if (
                    !prefixes.some((prefix) =>
                        ctx.text?.toLowerCase().startsWith(prefix)
                    )
                ) {
                    return;
                }
            }

            const chatId = ctx.peerId!;
            const client = this.getUserClient(chatId, "chat");

            const user = ctx.senderId!;

            logger.info(`VK Chat ${chatId} user ${user} message: ${ctx.text}`);

            let completion = await client.completion(
                ctx.text!,
                user.toString()
            );

            logger.info(
                `VK Chat ${chatId} user ${user} completion: ${completion}`
            );

            if (completion == null) {
                logger.error(`VK Chat ${chatId} user ${user} completion error`);
                completion = i18next.t("completionError") as string;
            }

            await ctx.send(completion);

            await next();
        });
    }

    handleStart(): void {
        this.hearManager.hear(/^\/start$/i, async (ctx) => {
            let greeting;

            if (ctx.isChat) {
                greeting = i18next.t("greeting.group");
            } else {
                greeting = i18next.t("greeting.private");
            }

            await ctx.send(greeting);
        });
    }

    launch(): Promise<void> {
        return this.vk.updates.start().then(() => {
            logger.info("VK bot started");
        });
    }
}
