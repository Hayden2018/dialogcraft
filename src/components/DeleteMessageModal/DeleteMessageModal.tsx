import { ModalPayload } from "redux/type";
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useDeleteMessageActions } from "./DeleteMessageModal.hook";

function DeleteMessageModal({ chatId, msgId } : ModalPayload) {

    const { confirmDelete, cancelDelete } = useDeleteMessageActions(chatId!, msgId!);

    return (
        <Dialog open>
            <DialogContent>
                Are you sure you want to delete this message?
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

export default DeleteMessageModal;