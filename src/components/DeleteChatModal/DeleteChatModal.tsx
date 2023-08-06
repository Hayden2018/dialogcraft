import { useSelector } from "react-redux";
import { AppState, ModalPayload, ModalType } from "redux/type";
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useDeleteChatActions } from "./DeleteChatModal.hook";



function DeleteChatModal({ chatId } : ModalPayload) {

    const { confirmDelete, cancelDelete } = useDeleteChatActions(chatId!);

    return (
        <Dialog open>
            <DialogContent>
                Are you sure you want to delete this chat with all its messages?
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelDelete}>
                    Cancel
                </Button>
                <Button color='error' onClick={confirmDelete}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default DeleteChatModal;