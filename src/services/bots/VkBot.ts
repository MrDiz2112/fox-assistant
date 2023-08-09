import BaseBot from "./BaseBot";
import { VK, WallAttachment } from "vk-io";
import { HearManager } from "@vk-io/hear";
import { ICompletionHandler } from "../../interfaces/ICompletionHandler";
import { CompletionHandlerContext } from "../../domain/CompletionHandlerContext";
import Logger from "../../core/Logger";
import i18next from "i18next";
import * as util from "util";

const logger = Logger.getLogger("VKBot");

export default class VkBot extends BaseBot {
    static TOKEN = process.env.VK_TOKEN!;
    vk: VK = new VK({
        token: VkBot.TOKEN,
        language: "en",
    });

    // TODO context
    hearManager = new HearManager();

    constructor(commandHandler: ICompletionHandler) {
        super(commandHandler);

        this.vk.updates.on("message_new", this.hearManager.middleware);
    }
    handleMessageText(): void {
        this.vk.updates.on("message_new", async (ctx, next) => {
            if (ctx.attachments?.length > 0) {
                return next();
            }

            let context = await this.getContext(ctx);

            let completion = await this.completionHandler
                .handleMessageText(context)
                .catch((err) => {
                    logger.error(err);
                });

            if (completion == null) {
                logger.error(
                    `Chat ${context.chatId} user ${context.username} completion error`
                );
                // completion = i18next.t("completionError") as string;

                return next();
            }

            await ctx.send(completion);
            return next();
        });
    }

    handleForward(): void {
        this.vk.updates.on("message_new", async (ctx, next) => {
            if (ctx.attachments?.length == 0) {
                return next();
            }

            let context = await this.getContext(ctx);

            // @ts-ignore
            const wallPost = ctx.attachments.find(
                (a) => a.type === "wall"
            ) as WallAttachment;

            // @ts-ignore
            const text = wallPost?.text;
            // @ts-ignore
            const groupName = wallPost?.payload?.from?.name;

            if (text == null || text.length === 0) {
                return next();
            }

            const message = util
                .format(
                    i18next.t("forward_note"),
                    i18next.t("social.vk"),
                    groupName ?? i18next.t("social.group.unknown")
                )
                .concat(text);

            context = {
                ...context,
                messageType: "forward",
                messageText: message,
            };

            let completion = await this.completionHandler
                .handleMessageText(context)
                .catch((err) => {
                    logger.error(err);
                });

            if (completion == null) {
                logger.error(
                    `Chat ${context.chatId} user ${context.username} forward completion error`
                );
                // completion = i18next.t("completionError") as string;

                return next();
            }

            await ctx.send(completion);
            return next();
        });
    }

    handleCommandStart(): void {
        this.hearManager.hear(/^\/start$/i, async (ctx) => {
            const context = await this.getContext(ctx);

            let greeting = this.completionHandler.handleCommandStart(context);

            await ctx.send(greeting);
        });
    }

    handleCommandHistory(): void {
        this.hearManager.hear(/^\/history$/i, async (ctx) => {
            const context = await this.getContext(ctx);

            const history =
                this.completionHandler.handleCommandHistory(context);

            await ctx.send(history);
        });
    }

    handleCommandClear(): void {
        this.hearManager.hear(/^\/clear$/i, async (ctx) => {
            const context = await this.getContext(ctx);

            const message = this.completionHandler.handleCommandClear(context);

            await ctx.send(message);
        });
    }

    launch(): Promise<void> {
        return this.vk.updates.start().then(() => {
            logger.info("VK bot started");
        });
    }

    private async getContext(ctx: any): Promise<CompletionHandlerContext> {
        const users = await this.vk.api.users.get({
            user_ids: ctx.senderId,
        });

        let username;

        if (users[0] != null) {
            username = `${users[0].first_name}${users[0].last_name}`;
        } else {
            username = ctx.senderId.toString();
        }

        return {
            chatId: ctx.peerId!,
            chatType: ctx.isChat ? "group" : "user",
            messageType: "text",
            messageText: ctx.text!,
            username: username,
        };
    }
}
