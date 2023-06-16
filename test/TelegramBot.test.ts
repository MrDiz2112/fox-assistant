import { ICompletionClientFactory } from "../src/interfaces/ICompletionClientFactory";
import { describe } from "node:test";
import { ICompletionClient } from "../src/interfaces/ICompletionClient";
import TelegramBot from "../src/services/TelegramBot";

let factory: ICompletionClientFactory;

describe("TelegramBot", () => {
    beforeEach(() => {
        factory = {
            createClient: jest.fn().mockReturnValue({
                getMessages: jest.fn().mockReturnValue([]),
                clearMessages: jest.fn(),
                completion: jest.fn(
                    (text, user?: string) =>
                        new Promise<string | undefined>(() => {})
                ),
            } as ICompletionClient),
        };
    });

    test("TelegramBot_FirstMessage_NewClientCreated", () => {
        const bot = new TelegramBot(factory);
    });
});
