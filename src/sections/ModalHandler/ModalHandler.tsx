import DeleteChatModal from "components/DeleteChatModal/DeleteChatModal";
import { useSelector } from "react-redux";
import { AppState, ModalType } from "redux/type.d";



function ModalHandler() {
    
    const { currentOpen, payload } = useSelector((state: AppState) => state.modal);

    switch (currentOpen) {
        case ModalType.DELETE_CHAT:
            return <DeleteChatModal {...payload} />;
        default:
            return null;
    }

}

export default ModalHandler;