export type ChatMessage = {
    id: string;
    time: number;
    role: 'assistant' | 'system' | 'user';
    content: string;
    editedContent: string;
    author?: string;
}

export type Chat = {
    id: string;
    title: string;
    messages: Array<ChatMessage>;
    rollbackMessage: ChatMessage | null;
    streamingMsgId: string | null;
}

export type ChatList = {
    chatOrder: Array<string>;
    currentChatId: string;
    incrementer: number;
}

export enum ModalType {
    DELETE_CHAT = 'DELETE_CHAT',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    EDIT_MESSAGE = 'EDIT_MESSAGE',
    RESTORE_MESSAGE = 'RESTORE_MESSAGE',
    REGENERATE_MESSAGE = 'REGEN_MESSAGE',
    CHAT_SETTING = 'CHAT_SETTING',
    GLOBAL_SETTING = 'GLOBAL_SETTING',
    CHAT_ERROR = 'CHAT_ERROR',
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

export enum SettingStatus {
    OK = 'OK',
    NO_KEY = 'NO_KEY',
    VERIFYING = 'VERIFYING',
    ERROR = 'ERROR',
    RESET = 'RESET',
    IMPORT = 'IMPORT',
    IMPORT_ERROR = 'IMPORT_ERROR',
    IMPORT_SUCCESS = 'IMPORT_SUCCESS',
}

export type SettingConfig = {
    currentModel: string;
    temperature: number;
    topP: number;
    systemPrompt: string;
    maxContext: number;
    darkMode?: boolean; 
    availableModels: Array<string>;
    status?: SettingStatus;
    enterSend?: boolean;
    apiKey?: string;
    baseURL?: string;
}