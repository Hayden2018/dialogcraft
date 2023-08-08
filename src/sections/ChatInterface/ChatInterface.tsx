import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { TextField } from '@mui/material';
import MessageBubble from 'components/MessageBubble/MessageBubble';
import { useChatEditActions, useCurrentChatSelector, useMessageActions } from './ChatInterface.hook';
import { ChatMessage } from 'redux/type';
import { type } from 'os';

const ChatContainer = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: '78%',
        verticalAlign: 'top',
        position: 'relative',
    })
);

const HeaderBanner = styled('div')(
    ({ theme }) => ({
        padding: '12px 16px 12px 25px',
        background: theme.palette.grey[900],
        borderBottom: `1px solid ${theme.palette.grey[800]}`
    })
);

const ChatTitle = styled('div')(
    ({ theme }) => ({
        fontSize: 22,
        display: 'inline-block',
        width: 'calc(100% - 180px)',
        lineHeight: '36px',
    })
);

const EditModeButton = styled(Button)(
    ({ theme }) => ({
        verticalAlign: 'top',
        padding: 0,
        width: 180,
        height: 36,
    })
);

interface AreaProps {
    isEditing: boolean;
}

const MessageArea = styled('div')<AreaProps>(
    ({ theme, isEditing }) => ({
        height: isEditing ? 'calc(100vh - 190px)' : 'calc(100vh - 60px)',
        overflowY: 'scroll',
        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
            background: theme.palette.grey[800],
            borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.grey[700],
        },
    })
);

const DraftGrid = styled('div')(
    ({ theme }) => ({
        height: 125,
        display: 'grid',
        gridTemplateColumns: 'calc(100% - 180px) 180px',
        gridTemplateRows: '1fr 1fr',
    })
)

const MessageInput = styled(TextField)(
    ({ theme }) => ({
        margin: 12,
        gridColumn: '1',
        gridRow: '1 / span 2',
    })
);

const SendButton = styled(Button)(
    ({ theme }) => ({
        width: 165,
        height: 45,
        margin: '12px 10px 0px 0px',
        gridColumn: '2',
        gridRow: '1',
    })
);

const RegenerateButton = styled(Button)(
    ({ theme }) => ({
        width: 165,
        height: 45,
        margin: '2px 10px 0px 0px',
        gridColumn: '2',
        gridRow: '2',
    })
);

function ChatInterface() {

    const currentChat = useCurrentChatSelector();
    const { onChange, sendMessage, regenerate, value } = useMessageActions(currentChat);
    const { editing, toggleEdit } = useChatEditActions(currentChat);

    if (currentChat) return (
        <ChatContainer>
            <HeaderBanner>
                <ChatTitle>{currentChat.title}</ChatTitle>
                <EditModeButton variant='contained' onClick={toggleEdit}>
                   { editing ? 'Stop Editing' : 'Edit Messages' }
                </EditModeButton>
            </HeaderBanner>
            <MessageArea isEditing>
                {
                    currentChat.messages.map((msg: ChatMessage) => 
                        <MessageBubble
                            key={msg.id}
                            msgId={msg.id}
                            chatId={currentChat.id}
                            msgContent={msg.content}
                            role={msg.role}
                            editMode={editing}
                        />
                    )
                }
            </MessageArea>
            {
                !editing &&
                <DraftGrid>
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
                </DraftGrid>
            }
        </ChatContainer>
    )
    else return (
        <ChatContainer>

        </ChatContainer>
    )
}

export default ChatInterface;