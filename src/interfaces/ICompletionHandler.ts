import { CompletionHandlerContext } from "../domain/CompletionHandlerContext";
import { ICompletionClient } from "./ICompletionClient";

export interface ICompletionHandler {
    handleMessageText(
        ctx: CompletionHandlerContext
    ): Promise<string | undefined>;
    handleCommandStart(ctx: CompletionHandlerContext): string;
    handleCommandHistory(ctx: CompletionHandlerContext): string;
    handleCommandClear(ctx: CompletionHandlerContext): string;
    getUserClient(ctx: CompletionHandlerContext): ICompletionClient;
}
