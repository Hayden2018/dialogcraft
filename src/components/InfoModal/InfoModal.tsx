import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useDispatch } from "react-redux";
import { closeModal } from "redux/modalSlice";


function InfoModal(
    { message, actionName = 'OK', action, color } : 
    { message: string, action?: () => any, actionName: string, color: 'error' | 'info' }
) {

    const dispatch = useDispatch();

    return (
        <Dialog open>
            <DialogContent>
                {message}
            </DialogContent>
            <DialogActions>
                <Button color={color} onClick={() => {
                    dispatch(closeModal());
                    action && action();
                }}>
                    {actionName}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default InfoModal;