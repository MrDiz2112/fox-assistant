import { IBotManager } from "../interfaces/IBotManager";
import { IBot } from "../interfaces/IBot";
import { CompletionClientFactory } from "./CompletionClientFactory";
import TelegramBot from "./TelegramBot";

export default class BotManager implements IBotManager {
    bots: IBot[] = [];

    constructor() {
        const factory = new CompletionClientFactory();

        this.bots = [new TelegramBot(factory)];
    }

    handleBotsEvents(): void {
        for (const bot of this.bots) {
            bot.handleStart();

            bot.handleCommandHistory();
            bot.handleCommandClear();
            bot.handleCommandGpt();

            bot.handleMessageText();
        }
    }

    launchBots(): void {
        for (const bot of this.bots) {
            bot.launch();
        }
    }
}
