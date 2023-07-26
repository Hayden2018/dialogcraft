import Button from '@mui/material/Button';
import { useDispatch }  from 'react-redux';
import { styled } from '@mui/system';
import { TextField } from '@mui/material';
import MarkDownMessage from 'components/MarkDownMessage/MarkDownMessage';

const ChatContainer = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: '80%',
        minWidth: 720,
        verticalAlign: 'top',
        position: 'relative',
    })
);

const MessageArea = styled('div')(
    ({ theme }) => ({
        height: '100vh',
        width: '80%',
        minWidth: 720,
        verticalAlign: 'top',
        position: 'relative',
    })
);

const MessageInput = styled(TextField)(
    ({ theme }) => ({
        width: 'calc(100% - 180px)',
        position: 'absolute',
        right: 165,
        bottom: 15,
        
    })
);

const SendButton = styled(Button)(
    ({ theme }) => ({
        width: 146,
        height: 45,
        position: 'absolute',
        right: 10,
        bottom: 71,
    })
);

const RegenerateButton = styled(Button)(
    ({ theme }) => ({
        width: 146,
        height: 45,
        position: 'absolute',
        right: 10,
        bottom: 16,
        
    })
);

function ChatInterface() {

    const dispatch = useDispatch();
    return (
        <ChatContainer>
            <MarkDownMessage />
            <MessageInput
                multiline
                label='Message ChatGPT'
                minRows={3}
                maxRows={3}
            />
            <SendButton variant='contained'>
                Send
            </SendButton>
            <RegenerateButton variant='contained'>
                Regenerate
            </RegenerateButton>
        </ChatContainer>
    );
}

export default ChatInterface;