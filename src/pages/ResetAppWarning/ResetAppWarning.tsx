import { useDispatch } from 'react-redux';
import { Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { resetSettings } from 'redux/settingSlice';
import { resetChatList } from 'redux/chatListSlice';
import { resetChats } from 'redux/chatsSlice';
import { PageType } from "redux/type.d";
import { useBackButton } from 'utils';
import { back, navigate, resetPages } from 'redux/pageSlice';

const Container = styled('div')(
    ({ theme }) => ({
        margin: '0px auto',
        height: '100%',
        width: '100%',
        maxWidth: '600px',
        padding: '0px 25px',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
    })
);

const InfoList = styled('ul')(
    ({ theme }) => ({
        margin: 0,
        paddingLeft: 20,
        '& > p': {
            margin: '0px 0px 8px -16px',
            fontSize: 16,
        },
        '& > li': {
            marginTop: 3,
            fontSize: 15,
        }
    })
);

const ButtonRow = styled('div')(
    ({ theme }) => ({
        margin: '20px 0px 30px',
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
    })
);

const ActionButton = styled(Button)(
    ({ theme }) => ({
        width: 120,
        height: 40,
        padding: 0,
    })
);

function ResetAppWarning() {

    const dispatch = useDispatch();

    const resetApp = () => {
        dispatch(navigate({ to: PageType.LOGIN }));
        dispatch(resetSettings());
        dispatch(resetChatList());
        dispatch(resetPages());
        dispatch(resetChats());
    }

    const backToSetting = () => dispatch(back());
    useBackButton(backToSetting);

    return (
        <Container>
            <h1>Reset Application</h1>
            <Alert severity='error'>
                <InfoList>
                    <p>By resetting the application you will:</p>
                    <li>Delete all your conversations and messages on this app.</li> 
                    <li>Delete all your setting configurations on this app.</li>
                    <li>Remove your locally stored API credentials.</li>
                </InfoList>
            </Alert>
            <ButtonRow>
                <ActionButton color='success' variant='contained' onClick={backToSetting}>
                    Cancel
                </ActionButton>
                <ActionButton color='error' variant='contained' onClick={resetApp}>
                    Reset
                </ActionButton>
            </ButtonRow>
        </Container>
    )
}

export default ResetAppWarning;