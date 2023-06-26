export interface CompletionHandlerContext {
    chatType?: "user" | "group";
    chatId?: number;
    messageType?: "text" | "forward";
    messageText?: string;
    username?: string;
}
