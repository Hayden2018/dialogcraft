import { ModalPayload } from "redux/type";
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import { useChatRenameActions } from "./ChatRenameModal.hook";
import { DialogTitle } from "@mui/material";
import { styled } from '@mui/system';
import { TextField } from '@mui/material';

const EditBox = styled(TextField)(
    ({ theme }) => ({
        width: 'calc(100% - 32px)',
        margin: '5px 16px',
    })
);

function ChatRenameModal({ chatId } : ModalPayload) {

    const { draft, confirmRename, cancelRename, onKeyDown, onEdit } = useChatRenameActions(chatId);

    return (
        <Dialog open fullWidth maxWidth='sm'>
            <DialogTitle>Rename Chat</DialogTitle>
            <div>
                <EditBox
                    label='New Title'
                    value={draft}
                    onChange={onEdit}
                    onKeyDown={onKeyDown}
                />
            </div>
            <DialogActions>
                <Button onClick={cancelRename}>
                    Cancel
                </Button>
                <Button color='warning' onClick={confirmRename}>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ChatRenameModal;