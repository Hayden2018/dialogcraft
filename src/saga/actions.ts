import { ChatMessage } from "redux/type"

export const actionType = {
    ON_MESSAGE: 'ON_MESSAGE',
}


export function userMessageSent(messageData: { chatId: string, messageContent: string }) {
    return {
        type: actionType.ON_MESSAGE,
        payload: messageData,
    }
}