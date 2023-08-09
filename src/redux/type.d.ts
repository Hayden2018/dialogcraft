export type ChatMessage = {
    id: string;
    time: Date;
    role: string;
    content: string;
    editedContent: string;
    author?: string;
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

export enum ModalType {
    DELETE_CHAT = 'DELETE_CHAT',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    EDIT_MESSAGE = 'EDIT_MESSAGE',
    REGENERATE_MESSAGE = 'REGEN_MESSAGE',
    CHAT_SETTING = 'CHAT_SETTING',
    GLOBAL_SETTING = 'GLOBAL_SETTING',
}

export type ModalPayload = {
    chatId?: string;
    msgId?: string;
}

export type ModalConfig = {
    currentOpen: ModalType | null;
    payload: ModalPayload;
}

export type AppState = {
    chatList: ChatList;
    chats: ChatRecords;
    modal: ModalConfig;
}