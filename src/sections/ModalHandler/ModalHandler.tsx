
import { useDispatch, useSelector } from "react-redux";
import { AppState, ModalType } from "redux/type.d";
import { deleteChat, deleteMessage, restoreMessage } from "redux/chatsSlice";
import { triggerRegenerate } from "saga/actions";
import { removeFromList } from "redux/chatListSlice";
import { deleteSetting } from "redux/settingSlice";
import GlobalSettingModal from "components/GlobalSettingModal/GlobalSettingModal";
import ChatSettingModal from "components/ChatSettingModal/ChatSettingModal";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import EditMessageModal from "components/EditMessageModal/EditMessageModal";


function ModalHandler() {

    const dispatch = useDispatch();
    
    const { currentOpen, payload } = useSelector((state: AppState) => state.modal);

    switch (currentOpen) {
        case ModalType.DELETE_CHAT:
            return (
                <ConfirmationModal
                    message='Are you sure to delete this chat? All messages will be deleted.'
                    action={() => {
                        const { chatId } = payload;
                        dispatch(removeFromList(chatId!));
                        dispatch(deleteChat(chatId));
                        dispatch(deleteSetting({ settingId: chatId }));
                    }}
                    actionName='Delete'
                    color='error'
                />
            )
        case ModalType.DELETE_MESSAGE:
            return (
                <ConfirmationModal
                    message='Are you sure to delete this message?'
                    action={() => dispatch(deleteMessage(payload))}
                    actionName='Delete'
                    color='error'
                />
            )
        case ModalType.RESTORE_MESSAGE:
            return (
                <ConfirmationModal
                    message='Are you sure to restore this message? All edited content will be lost.'
                    action={() => dispatch(restoreMessage(payload))}
                    actionName='Restore'
                    color='warning'
                />
            )
        case ModalType.REGENERATE_MESSAGE:
            return (
                <ConfirmationModal
                    message='Regenerate this message? Existing content including edit will be lost.'
                    action={() => dispatch(triggerRegenerate(payload))}
                    actionName='Regenerate'
                    color='warning'
                />
            )
        case ModalType.EDIT_MESSAGE:
            return <EditMessageModal {...payload} />;
        case ModalType.CHAT_SETTING:
            return <ChatSettingModal  {...payload} />;
        case ModalType.GLOBAL_SETTING:
            return <GlobalSettingModal />;
        default:
            return null;
    }
}


export default ModalHandler;