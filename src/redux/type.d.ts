export type ChatMessage = {
    id: string;
    time: number;
    role: 'assistant' | 'system' | 'user';
    content: string;
    editedContent: string;
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

export enum PageType {
    SETTING_GLOBAL = 'setting/global',
    SETTING_IMPORT = 'setting/import',
    SETTING_RESET = 'setting/reset',
    CHAT = 'chat',
    LOGIN = 'login',
}

export type PageConfig = {
    current: PageType,
    history: Array<PageType>,
}

export enum ModalType {
    DELETE_CHAT = 'DELETE_CHAT',
    DELETE_MESSAGE = 'DELETE_MESSAGE',
    EDIT_MESSAGE = 'EDIT_MESSAGE',
    RESTORE_MESSAGE = 'RESTORE_MESSAGE',
    REGENERATE_MESSAGE = 'REGEN_MESSAGE',
    CHAT_SETTING = 'CHAT_SETTING',
    CHAT_ERROR = 'CHAT_ERROR',
    CHAT_TIMEOUT = 'CHAT_TIMEOUT',
    RENAME_CHAT = 'RENAME_CHAT',
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
    page: PageConfig;
    chats: Record<string, Chat>;
    setting: Record<string, SettingConfig>,
}

export enum SettingStatus {
    OK = 'OK',
    NO_KEY = 'NO_KEY',
    VERIFYING = 'VERIFYING',
    ERROR = 'ERROR',
}

export type SettingConfig = {
    currentModel: string;
    temperature: number;
    topP: number;
    systemPrompt: string;
    maxContext: number;
    availableModels: Array<string>;
    urlType?: 'openai' | 'azure';
    darkMode?: boolean;
    autoTitle?: boolean;
    status?: SettingStatus;
    enterSend?: boolean;
    apiKey?: string;
    baseURL?: string;
}