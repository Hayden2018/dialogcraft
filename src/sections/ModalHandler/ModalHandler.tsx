import DeleteChatModal from "components/DeleteChatModal/DeleteChatModal";
import DeleteMessageModal from "components/DeleteMessageModal/DeleteMessageModal";
import EditMessageModal from "components/EditMessageModal/EditMessageModal";
import { useSelector } from "react-redux";
import { AppState, ModalType } from "redux/type.d";



function ModalHandler() {
    
    const { currentOpen, payload } = useSelector((state: AppState) => state.modal);

    switch (currentOpen) {
        case ModalType.DELETE_CHAT:
            return <DeleteChatModal {...payload} />;
        case ModalType.DELETE_MESSAGE:
            return <DeleteMessageModal {...payload} />;
        case ModalType.EDIT_MESSAGE:
            return <EditMessageModal {...payload} />;
        default:
            return null;
    }
}

export default ModalHandler;