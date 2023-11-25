import { useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stopStreaming } from "redux/chatsSlice";
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

    const enterSend = useSelector((state: AppState) => state.setting.global.enterSend);
    const dispatch = useDispatch();
    
    const [draft, setDraft] = useState<string>('');

    useEffect(() => { setDraft('') }, [currentChat]);

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

    const regenerate = () => {
        if (currentChat.messages.at(-1)) {
            dispatch(
                triggerRegenerate({
                    chatId: currentChat.id,
                    msgId: currentChat.messages.at(-1).id,
                })
            );
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                !enterSend && sendMessage();
            } else {
                enterSend && sendMessage();
            }
        }
    }

    const stopGenerate = () => {
        dispatch(stopStreaming({ chatId: currentChat.id }));
        document.dispatchEvent(
            new CustomEvent('interrupt', {
                detail: { chatId: currentChat.id }
            })
        );
    }

    return {
        onChange,
        sendMessage,
        regenerate,
        onKeyDown,
        stopGenerate,
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
