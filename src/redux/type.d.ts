export type ChatMessage = {
    id: string;
    time: Date;
    role: 'assistant' | 'system' | 'user';
    content: string;
    editedContent: string;
    author?: string;
}

export type Chat = {
    id: string;
    title: string;
    messages: Array<ChatMessage>;
    streamingMsgId: string | null;
}

export type ChatList = {
    chatOrder: Array<string>;
    currentChatId: string;
}

export enum ModalType {
    DELETE_CHAT = 'DELETE_CHAT',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    EDIT_MESSAGE = 'EDIT_MESSAGE',
    RESTORE_MESSAGE = 'RESTORE_MESSAGE',
    REGENERATE_MESSAGE = 'REGEN_MESSAGE',
    CHAT_SETTING = 'CHAT_SETTING',
    GLOBAL_SETTING = 'GLOBAL_SETTING',
}

export type ModalPayload = {
    chatId?: string;
    msgId?: string;
    settingId?: string;
}

export type ModalConfig = {
    currentOpen: ModalType | null;
    payload: ModalPayload;
}

export type AppState = {
    chatList: ChatList;
    modal: ModalConfig;
    chats: Record<string, Chat>;
    setting: Record<string, SettingConfig>,
}

export type SettingConfig = {
    currentModel: string;
    temperature: number;
    topP: number;
    systemPrompt: string;
    maxContext: number;
    isGobal: boolean;
    availableModels: Array<string>;
    status?: 'noKey' | 'ok' | 'verifying' | 'error';
    enterSend?: boolean;
    apiKey?: string;
    baseURL?: string;
}