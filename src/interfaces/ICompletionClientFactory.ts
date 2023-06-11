import { ChatCompletionRequestMessage } from "openai";
import { ICompletionClient } from "./ICompletionClient";

export type CompletionType = "openai";

export interface ICompletionClientFactory {
    createClient(
        type: CompletionType,
        role: ChatCompletionRequestMessage[]
    ): ICompletionClient;
}
