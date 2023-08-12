import { ModalPayload } from "redux/type";
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { useEditMessageActions } from "./EditMessageModal.hook";
import { DialogTitle } from "@mui/material";
import { styled } from '@mui/system';
import { TextField } from '@mui/material';

const EditBox = styled(TextField)(
    ({ theme }) => ({
        width: 'calc(100% - 32px)',
        margin: '5px 16px',
    })
);

function EditMessageModal({ chatId, msgId } : ModalPayload) {

    const { draft, confirmEdit, cancelEdit, onEdit } = useEditMessageActions(chatId!, msgId!);

    return (
        <Dialog open fullWidth maxWidth='lg'>
            <DialogTitle>Edit Message</DialogTitle>
            <div>
                <EditBox
                    multiline
                    label='Markdown'
                    minRows={3}
                    maxRows={15}
                    value={draft}
                    onChange={onEdit}
                />
            </div>
            <DialogActions>
                <Button onClick={cancelEdit}>
                    Cancel
                </Button>
                <Button color='warning' onClick={confirmEdit}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditMessageModal;