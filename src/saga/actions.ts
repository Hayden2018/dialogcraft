import { ModalPayload, SettingConfig } from "redux/type"

export const actionType = {
    ON_MESSAGE: 'ON_MESSAGE',
    REGENERATE: 'REGENERATE',
    GLOBAL_SETTING: 'GLOBAL_SETTING',
}

export function userMessageSent(data: { chatId: string, messageContent: string }) {
    return {
        type: actionType.ON_MESSAGE,
        payload: data,
    }
}

export function triggerRegenerate(data: ModalPayload) {
    return {
        type: actionType.REGENERATE,
        payload: data,
    }
}

export function updateGlobalSetting(data: SettingConfig) {
    return {
        type: actionType.GLOBAL_SETTING,
        payload: data,
    }
}