import { ChatCompletionRequestMessage } from "openai";

export interface ICompletionClient {
    getMessages(): ChatCompletionRequestMessage[];
    clearMessages(): void;
    completion(text: string, user?: string): Promise<string | undefined>;
}
