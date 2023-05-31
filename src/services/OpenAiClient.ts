import {
    ChatCompletionRequestMessage,
    ChatCompletionRequestMessageRoleEnum,
    Configuration,
    OpenAIApi,
} from "openai";
import logger from "../core/logger";
import {IOpenAiClient} from "../interfaces/IOpenAiClient";

export default class OpenAiClient implements IOpenAiClient {
    static OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

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
        return this.messages;
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

        const completion = await this.openai
            .createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0.6,
                messages: this.messages,
            })
            .then((res) => {
                logger.info(`${res.status} - ${res.statusText}`);

                return res;
            })
            .catch((res) => {
                logger.error(`${res.status} - ${res.statusText}`);

                return undefined;
            });

        if (completion == undefined) {
            return undefined;
        }

        const completionMessage = completion.data.choices[0]?.message;

        if (completionMessage) {
            this.updateMessages(completionMessage);
        }

        return completionMessage?.content;
    }
}
