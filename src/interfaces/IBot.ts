export interface IBot {
    handleStart(): void;
    handleCommandClear(): void;
    handleCommandHistory(): void;
    handleCommandGpt(): void;
    handleMessageText(): void;
    launch(): Promise<void>;
}
