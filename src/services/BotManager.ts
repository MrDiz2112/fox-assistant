import { IBotManager } from "../interfaces/IBotManager";
import { CompletionClientFactory } from "./CompletionClientFactory";
import VkBot from "./bots/VkBot";
import TelegramBot from "./bots/TelegramBot";
import BaseBot from "./bots/BaseBot";
import CompletionHandler from "./handlers/CompletionHandler";

export default class BotManager implements IBotManager {
    bots: BaseBot[] = [];

    constructor() {
        const factory = new CompletionClientFactory();
        const handler = new CompletionHandler(factory);

        this.bots = [new TelegramBot(handler), new VkBot(handler)];
    }

    handleBotsEvents(): void {
        for (const bot of this.bots) {
            bot.handleCommandStart();
            bot.handleCommandHistory();
            bot.handleCommandClear();
            bot.handleMessageText();
            // bot.handleForward();
        }
    }

    launchBots(): void {
        for (const bot of this.bots) {
            bot.launch();
        }
    }
}
