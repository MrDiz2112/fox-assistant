import BaseBot from "./BaseBot";
import { VK, WallAttachment } from "vk-io";
import { HearManager } from "@vk-io/hear";
import { ICompletionHandler } from "../../interfaces/ICompletionHandler";
import { CompletionHandlerContext } from "../../domain/CompletionHandlerContext";
import Logger from "../../core/Logger";
import i18next from "i18next";

const logger = Logger.getLogger("VKBot");

export default class VkBot extends BaseBot {
    static TOKEN = process.env.VK_TOKEN!;
    vk: VK = new VK({
        token: VkBot.TOKEN,
    });

    // TODO context
    hearManager = new HearManager();

    constructor(commandHandler: ICompletionHandler) {
        super(commandHandler);

        this.vk.updates.on("message_new", this.hearManager.middleware);
    }
    handleMessageText(): void {
        this.vk.updates.on("message_new", async (ctx, next) => {
            let context = this.getContext(ctx);

            if (ctx.attachments != null) {
                // @ts-ignore
                const wallPost = ctx.attachments.find(
                    (a) => a.type === "wall"
                ) as WallAttachment;

                // @ts-ignore
                const text = wallPost?.payload?.text;

                if (text == null) {
                    return;
                }

                context = {
                    ...context,
                    messageType: "forward",
                    messageText: i18next.t("forward_note").concat(text),
                };
            }

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

                return;
            }

            await ctx.send(completion);
            await next();
        });
    }

    handleForward(): void {}

    handleCommandStart(): void {
        this.hearManager.hear(/^\/start$/i, async (ctx) => {
            const context = this.getContext(ctx);

            let greeting = this.completionHandler.handleCommandStart(context);

            await ctx.send(greeting);
        });
    }

    handleCommandHistory(): void {
        this.hearManager.hear(/^\/history$/i, async (ctx) => {
            const context = this.getContext(ctx);

            const history =
                this.completionHandler.handleCommandHistory(context);

            await ctx.send(history);
        });
    }

    handleCommandClear(): void {
        this.hearManager.hear(/^\/clear$/i, async (ctx) => {
            const context = this.getContext(ctx);

            const message = this.completionHandler.handleCommandClear(context);

            await ctx.send(message);
        });
    }

    launch(): Promise<void> {
        return this.vk.updates.start().then(() => {
            logger.info("VK bot started");
        });
    }

    private getContext(ctx: any): CompletionHandlerContext {
        return {
            chatId: ctx.peerId!,
            chatType: ctx.isChat ? "group" : "user",
            messageText: ctx.text!,
            username: ctx.senderId.toString(),
        };
    }
}
