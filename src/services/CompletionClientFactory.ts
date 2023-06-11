import {
    CompletionType,
    ICompletionClientFactory,
} from "../interfaces/ICompletionClientFactory";
import { ICompletionClient } from "../interfaces/ICompletionClient";
import OpenAiClient from "./OpenAiClient";
import { ChatCompletionRequestMessage } from "openai";

export class CompletionClientFactory implements ICompletionClientFactory {
    createClient(
        type: CompletionType,
        role: ChatCompletionRequestMessage[]
    ): ICompletionClient {
        switch (type) {
            case "openai":
                return new OpenAiClient(role);
        }
    }
}
