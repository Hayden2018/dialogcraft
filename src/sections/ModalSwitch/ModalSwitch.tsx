
import { useDispatch, useSelector } from "react-redux";
import { AppState, ModalType } from "redux/type.d";
import { deleteChat, deleteMessage, restoreMessage } from "redux/chatsSlice";
import { triggerRegenerate } from "saga/actions";
import { removeFromList } from "redux/chatListSlice";
import { deleteSetting } from "redux/settingSlice";

import ChatSettingModal from "components/ChatSettingModal/ChatSettingModal";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import EditMessageModal from "components/EditMessageModal/EditMessageModal";
import InfoModal from "components/InfoModal/InfoModal";
import ChatRenameModal from "components/ChatRenameModal/ChatRenameModal";

function ModalSwitch() {

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
        case ModalType.CHAT_ERROR:
            return (
                <InfoModal 
                    message='An error occurs while generating response. Make sure your API credentials are correct and device connected to the internet.'
                    actionName='OK'
                    color='error'
                />
            )
        case ModalType.CHAT_TIMEOUT:
            return (
                <InfoModal 
                    message='Response generation timeout. Please try again later.'
                    actionName='OK'
                    color='error'
                />
            )
        case ModalType.RENAME_CHAT:
            return  <ChatRenameModal {...payload} />;
        case ModalType.EDIT_MESSAGE:
            return <EditMessageModal {...payload} />;
        case ModalType.CHAT_SETTING:
            return <ChatSettingModal  {...payload} />;
        default:
            return null;
    }
}


export default ModalSwitch;