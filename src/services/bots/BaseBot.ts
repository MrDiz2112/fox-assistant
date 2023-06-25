import { ICompletionHandler } from "../../interfaces/ICompletionHandler";

abstract class BaseBot {
    protected constructor(protected completionHandler: ICompletionHandler) {}

    abstract handleMessageText(): void;

    abstract handleCommandStart(): void;

    abstract handleCommandClear(): void;

    abstract handleCommandHistory(): void;

    abstract launch(): Promise<void>;
}

export default BaseBot;
