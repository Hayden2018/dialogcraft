import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { editChatTitle } from "redux/chatsSlice";
import { AppState } from "redux/type";
import { useState } from "react";

export const useChatRenameActions = (chatId: string) => {

    const currentTitle = useSelector((state: AppState) => {
        return state.chats[chatId].title;
    });

    const [draft, setDraft] = useState<string>(currentTitle);

    const dispatch = useDispatch();

    const cancelRename = () => dispatch(closeModal());

    const onEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputElement = event.target as HTMLInputElement;
        setDraft(inputElement.value);
    }

    const confirmRename = () => {
        dispatch(editChatTitle({ chatId, newTitle: draft }));
        dispatch(closeModal());
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            confirmRename();
        }
    }

    return {
        draft,
        cancelRename,
        confirmRename,
        onKeyDown,
        onEdit,
    }
}