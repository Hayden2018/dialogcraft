import { useDispatch, useSelector } from 'react-redux';
import { openModal } from 'redux/modalSlice';
import { AppState, ModalType } from 'redux/type.d';

const useChatTitleWithEdit = (chatId: string) => {

    const dispatch = useDispatch();
    const title = useSelector((state: AppState) => state.chats[chatId].title);

    const renameTitle = (event: React.MouseEvent) => {
        event.stopPropagation();
        dispatch(
            openModal({
                type: ModalType.RENAME_CHAT,
                chatId,
            })
        );
    }

    const deleteChat = (event: React.MouseEvent) => {
        event.stopPropagation();
        dispatch(
            openModal({
                type: ModalType.DELETE_CHAT,
                chatId,
            })
        );
    }
    
    return {
        title,
        renameTitle,
        deleteChat,
    };
}

export default useChatTitleWithEdit;