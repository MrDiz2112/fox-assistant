import { ICompletionHandler } from "../../interfaces/ICompletionHandler";
import i18next from "i18next";
import logger from "../../core/logger";
import { CompletionHandlerContext } from "../../domain/CompletionHandlerContext";
import {
    CompletionType,
    ICompletionClientFactory,
} from "../../interfaces/ICompletionClientFactory";
import { ICompletionClient } from "../../interfaces/ICompletionClient";
import {
    TSUNDERE_ROLE_GROUP,
    TSUNDERE_ROLE_PRIVATE,
} from "../../const/roleMessages";

export default class CompletionHandler implements ICompletionHandler {
    clientCompletionType: CompletionType = "openai";
    clients: Map<number, ICompletionClient> = new Map();

    constructor(private completionClientFactory: ICompletionClientFactory) {}

    async handleMessageText(
        ctx: CompletionHandlerContext
    ): Promise<string | undefined> {
        if (ctx.chatType === "group") {
            const prefixes = [
                i18next.t("names.name1").toLowerCase(),
                i18next.t("names.name2").toLowerCase(),
            ];

            if (
                !prefixes.some((prefix) =>
                    ctx.messageText?.toLowerCase()?.startsWith(prefix)
                )
            ) {
                return undefined;
            }
        }

        const chatId = ctx.chatId;
        const user = ctx.username;
        const message = ctx.messageText!;

        logger.info(`Chat ${chatId} user ${user} message: ${message}`);

        const client = this.getUserClient(ctx);

        return client.completion(message, user);
    }

    handleCommandStart(ctx: CompletionHandlerContext): string {
        let greeting;

        switch (ctx.chatType) {
            case "user":
                greeting = i18next.t("greeting.private");
                break;
            case "group":
                greeting = i18next.t("greeting.group");
                break;
            default:
                greeting = i18next.t("greeting.private");
                break;
        }

        return greeting;
    }

    handleCommandHistory(ctx: CompletionHandlerContext): string {
        const client = this.getUserClient(ctx);
        const messagesHistory = client.getMessages();

        logger.info(`Chat ${ctx.chatId} history requested`);

        const historyFormatted = messagesHistory.map((message) => {
            let name;

            switch (message.role) {
                case "user":
                    name = ctx.username;
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

        return historyFormatted.join("\n");
    }

    handleCommandClear(ctx: CompletionHandlerContext): string {
        const chatId = ctx.chatId;

        const client = this.getUserClient(ctx);
        client.clearMessages();

        logger.info(`Chat ${chatId} history cleared`);

        return i18next.t("clearHistory");
    }

    getUserClient(ctx: CompletionHandlerContext): ICompletionClient {
        if (ctx.chatId == null) {
            throw new Error("ChatId is null");
        }

        if (!this.clients.has(ctx.chatId)) {
            let role;

            switch (ctx.chatType) {
                case "user":
                    role = TSUNDERE_ROLE_PRIVATE;
                    break;
                case "group":
                    role = TSUNDERE_ROLE_GROUP;
                    break;
                default:
                    role = TSUNDERE_ROLE_PRIVATE;
                    break;
            }

            const newClient = this.completionClientFactory.createClient(
                this.clientCompletionType,
                role
            );

            this.clients.set(ctx.chatId, newClient);
            logger.info(`New client created for chat ${ctx.chatId}`);
        }

        return this.clients.get(ctx.chatId)!;
    }
}
