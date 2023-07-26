export type ChatMessage = {
    time: Date;
    role: string;
    message: string;
    editedMessage: string;
}

export type Chat = {
    messages: Array<ChatMessage>;
    title: string;
    id: string,
}

export type ChatList = {
    chatOrder: Array<string>;
    currentChatId: string;
}

type ChatRecords = Record<string, Chat>;

export type AppState = {
    chatList: ChatList;
    chats: ChatRecords;
}