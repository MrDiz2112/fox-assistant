export interface CompletionHandlerContext {
    chatType?: "user" | "group";
    chatId?: number;
    messageText?: string;
    username?: string;
}
