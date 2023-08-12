import { ChatMessage, ModalPayload } from "redux/type"

export const actionType = {
    ON_MESSAGE: 'ON_MESSAGE',
    REGENERATE: 'REGENERATE',
}

export function userMessageSent(messageData: { chatId: string, messageContent: string }) {
    return {
        type: actionType.ON_MESSAGE,
        payload: messageData,
    }
}

export function triggerRegenerate(messageData: ModalPayload) {
    return {
        type: actionType.REGENERATE,
        payload: messageData,
    }
}