import { useDispatch } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { deleteMessage } from "redux/chatsSlice";

export const useDeleteMessageActions = (chatId: string, msgId: string) => {

    const dispatch = useDispatch();

    const cancelDelete = () => dispatch(closeModal());

    const confirmDelete = () => {
        dispatch(deleteMessage({ chatId, msgId }));
        dispatch(closeModal());
    }

    return {
        cancelDelete,
        confirmDelete,
    }
}