import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { deleteMessage, editMessage } from "redux/chatsSlice";
import { AppState } from "redux/type";
import { useState } from "react";

export const useEditMessageActions = (chatId: string, msgId: string) => {

    const currentContent = useSelector((state: AppState) => {
        const messages = state.chats[chatId].messages;
        const targetMessage = messages.find((msg) => msg.id === msgId);
        return targetMessage!.editedContent || targetMessage!.content;
    });

    const [draft, setDraft] = useState<string>(currentContent);

    const dispatch = useDispatch();

    const cancelEdit = () => dispatch(closeModal());

    const onEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement; 
        setDraft(inputElement.value);
    }

    const confirmEdit = () => {
        dispatch(editMessage({ chatId, msgId, newContent: draft }));
        dispatch(closeModal());
    }

    return {
        draft,
        cancelEdit,
        confirmEdit,
        onEdit,
    }
}