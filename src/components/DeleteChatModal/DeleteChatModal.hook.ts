import { useDispatch } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { removeFromList } from "redux/chatListSlice";
import { deleteChat } from "redux/chatsSlice";

export const useDeleteChatActions = (chatId: string) => {

    const dispatch = useDispatch();

    const cancelDelete = () => dispatch(closeModal());

    const confirmDelete = () => {
        dispatch(removeFromList(chatId));
        dispatch(deleteChat(chatId));
        dispatch(closeModal());
    }

    return {
        cancelDelete,
        confirmDelete,
    }
}