export type ChatMessage = {
    time: Date;
    role: string;
    content: string;
    editedContent: string;
}

export type Chat = {
    messages: Array<ChatMessage>;
    title: string;
    id: string;
    streaming: boolean;
}

export type ChatList = {
    chatOrder: Array<string>;
    currentChatId: string;
}

export type ChatRecords = Record<string, Chat>;

export type AppState = {
    chatList: ChatList;
    chats: ChatRecords;
}