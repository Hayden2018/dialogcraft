import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState, Chat } from "redux/type";
import { userMessageSent } from "saga/actions";

export const useCurrentChatSelector = () => useSelector((state: AppState) => {
    const currentChatId = state.chatList.currentChatId;
    if (state.chatList.currentChatId) {
        return state.chats[currentChatId];
    } else {
        return null;
    }
})

export const useMessageActions = (currentChat: Chat | null) => {
    const [draft, setDraft] = useState('');
    const dispatch = useDispatch();

    useEffect(() => setDraft(''), [currentChat]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement; 
        setDraft(inputElement.value);
    }

    const sendMessage = () => {
        if (!currentChat || !draft) return;
        dispatch(userMessageSent({
            chatId: currentChat.id,
            messageContent: draft,
        }));
        setDraft('');
    }

    const regenerate = () => {};

    return {
        onChange,
        sendMessage,
        regenerate,
        value: draft,
    };
}
