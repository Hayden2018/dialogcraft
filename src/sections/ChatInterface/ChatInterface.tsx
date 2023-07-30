import Button from '@mui/material/Button';
import { useDispatch }  from 'react-redux';
import { styled } from '@mui/system';
import { TextField } from '@mui/material';
import MessageBubble from 'components/MessageBuble/MessageBubble';
import { useCurrentChatSelector, useMessageActions } from './ChatInterface.hook';
import { ChatMessage } from 'redux/type';

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
        height: 'calc(100vh - 130px)',
        overflowY: 'scroll',
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

    const currentChat = useCurrentChatSelector();
    const { onChange, sendMessage, regenerate, value } = useMessageActions(currentChat);

    if (currentChat) return (
        <ChatContainer>
            <MessageArea>
                {
                    currentChat.messages.map((msg: ChatMessage, index: number) => 
                        <MessageBubble 
                            chatId={currentChat.id}
                            msgContent={msg.markdown}
                            msgIndex={index}
                        />
                    )
                }
            </MessageArea>
            <MessageInput
                multiline
                label='Message ChatGPT'
                minRows={3}
                maxRows={3}
                value={value}
                onChange={onChange}
            />
            <SendButton variant='contained' onClick={sendMessage}>
                Send
            </SendButton>
            <RegenerateButton variant='contained'>
                Regenerate
            </RegenerateButton>
        </ChatContainer>
    )
    else return (
        <ChatContainer>

        </ChatContainer>
    )
}

export default ChatInterface;