import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from "openai";
import { ICompletionClient } from "../interfaces/ICompletionClient";
import Logger from "../core/Logger";

const logger = Logger.getLogger("OpenAiClient");

export default class OpenAiClient implements ICompletionClient {
    static OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
    static OPENAI_MODEL = process.env.OPENAI_MODEL!;

    private openai: OpenAIApi;
    private messages: ChatCompletionRequestMessage[] = [];
    constructor(private roleMessages: ChatCompletionRequestMessage[]) {
        this.openai = new OpenAIApi(
            new Configuration({
                apiKey: OpenAiClient.OPENAI_API_KEY,
            })
        );

        this.messages.push(...roleMessages);
    }

    private updateMessages(message: ChatCompletionRequestMessage): void {
        this.messages.push(message);
    }

    public getMessages(): ChatCompletionRequestMessage[] {
        return this.messages.splice(0, 2);
    }

    public clearMessages(): void {
        this.messages.length = 0;
        this.messages.push(...this.roleMessages);
    }

    public async completion(
        text: string,
        user?: string
    ): Promise<string | undefined> {
        this.updateMessages({
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: text,
            name: user,
        });

        const completionResponse = await this.openai
            .createChatCompletion({
                model: OpenAiClient.OPENAI_MODEL,
                temperature: 1,
                frequency_penalty: 0.3,
                presence_penalty: 0.7,
                messages: this.messages,
            })
            .then((res) => {
                logger.info(`${res.status} - ${res.statusText}`);

                return res;
            })
            .catch((res) => {
                logger.error(
                    `[${res.response.status}](${res.response.data.error.code}) - ${res.response.data.error.type} ${res.response.data.error.message}`
                );

                return undefined;
            });

        if (completionResponse == undefined) {
            return undefined;
        }

        const completionMessage = completionResponse.data.choices[0]?.message;

        if (completionMessage) {
            this.updateMessages(completionMessage);
        }

        return completionMessage?.content;
    }
}
