import { ICompletionClient } from "../../interfaces/ICompletionClient";
import {
    TSUNDERE_ROLE_GROUP,
    TSUNDERE_ROLE_PRIVATE,
} from "../../const/roleMessages";
import logger from "../../core/logger";
import {
    CompletionType,
    ICompletionClientFactory,
} from "../../interfaces/ICompletionClientFactory";

export default class BaseBot {
    clientCompletionType: CompletionType = "openai";
    clients: Map<number, ICompletionClient> = new Map();

    constructor(private completionClientFactory: ICompletionClientFactory) {}

    protected getUserClient(
        chatId: number,
        chatType: string
    ): ICompletionClient {
        if (!this.clients.has(chatId)) {
            let role;

            switch (chatType) {
                case "private":
                    role = TSUNDERE_ROLE_PRIVATE;
                    break;
                case "supergroup":
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

            this.clients.set(chatId, newClient);
            logger.info(`New client created for chat ${chatId}`);
        }

        return this.clients.get(chatId)!;
    }
}
