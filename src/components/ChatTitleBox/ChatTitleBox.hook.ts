import { ChangeEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editChatTitle } from 'redux/chatsSlice';
import { openDeleteChatModal } from 'redux/modalSlice';
import { AppState } from 'redux/type';

const useChatTitleWithEdit = (chatId: string) => {

    const dispatch = useDispatch();
    const currentTitle = useSelector((state: AppState) => state.chats[chatId].title);

    const [editTitle, setEditTitle] = useState<string>(currentTitle);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const startEdit = () => {
        setEditTitle(currentTitle);
        setIsEditing(true);
    };

    const onEdit = (event: ChangeEvent<HTMLInputElement>) => {
        setEditTitle(event.target.value);
    };

    const confirmEdit = () => {
        dispatch(editChatTitle({
            newTitle: editTitle,
            chatId,
        }));
        setIsEditing(false);
    };

    const abortEdit = () => {
        setEditTitle(currentTitle);
        setIsEditing(false);
    };

    const deleteChat = () => {
        dispatch(openDeleteChatModal(chatId));
    };

    const title = isEditing ? editTitle : currentTitle;
    
    return {
        title,
        isEditing,
        onEdit,
        startEdit,
        confirmEdit,
        abortEdit,
        deleteChat,
    };
}

export default useChatTitleWithEdit;