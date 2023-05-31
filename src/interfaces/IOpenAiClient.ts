import {ChatCompletionRequestMessage} from "openai";

export interface IOpenAiClient {
    getMessages(): ChatCompletionRequestMessage[];
    clearMessages(): void;
    completion(text: string, user?: string): Promise<string | undefined>;
}
