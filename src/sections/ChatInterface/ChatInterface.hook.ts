import { useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState, Chat } from "redux/type";
import { triggerRegenerate, userMessageSent } from "saga/actions";

export const useCurrentChatSelector = () => useSelector((state: AppState) => {
    const currentChatId = state.chatList.currentChatId;
    if (state.chatList.currentChatId) {
        return state.chats[currentChatId];
    } else {
        return null;
    }
})

export const useMessageActions = (currentChat: Chat | null) => {

    const [draft, setDraft] = useState<string>('');
    const dispatch = useDispatch();

    useEffect(() => setDraft(''), [currentChat]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement; 
        setDraft(inputElement.value);
    }

    const sendMessage = () => {
        if (currentChat && draft.trim()) {
            dispatch(userMessageSent({
                chatId: currentChat.id,
                messageContent: draft,
            }));
        }
        setDraft('');
    }

    const regenerate = () => dispatch(
        triggerRegenerate({
            chatId: currentChat?.id,
            msgId: currentChat?.messages.at(-1)?.id,
        })
    );

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && event.shiftKey) 
            sendMessage();
    }

    return {
        onChange,
        sendMessage,
        regenerate,
        onKeyDown,
        value: draft,
    };
}

export const useChatEditActions = (currentChat: Chat | null) => {

    const [editing, setIsEditing] = useState<boolean>(false);
    const toggleEdit = () => setIsEditing((prev) => !prev);

    useEffect(() => setIsEditing(false), [currentChat?.id]);

    return {
        toggleEdit,
        editing,
    };
}
