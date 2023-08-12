import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useDispatch } from "react-redux";
import { closeModal } from "redux/modalSlice";

function ConfirmationModal(
    { message, actionName, action, color } : 
    { message: string, action: () => any, actionName: string, color: 'success' | 'error' | 'info' | 'warning' }
) {

    const dispatch = useDispatch();

    return (
        <Dialog open>
            <DialogContent>
                {message}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => dispatch(closeModal())}>
                    Cancel
                </Button>
                <Button color={color} onClick={() => {
                    dispatch(closeModal());
                    action();
                }}>
                    {actionName}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ConfirmationModal;