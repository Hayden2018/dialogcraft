import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { LinearProgress, TextField } from '@mui/material';
import MessageBubble from 'components/MessageBubble/MessageBubble';
import { useChatEditActions, useCurrentChatSelector, useMessageActions } from './ChatInterface.hook';
import { ChatMessage, ModalType } from 'redux/type.d';
import { useEffect, useRef } from 'react';
import { ReactComponent as noChatIcon } from './noChat.svg';
import { useDispatch } from 'react-redux';
import { openModal } from 'redux/modalSlice';

const ChatContainer = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: 'calc(100% - 346px)',
        verticalAlign: 'top',
        position: 'relative',
    })
);

const HeaderBanner = styled('div')(
    ({ theme: { palette } }) => ({
        padding: '12px 16px 4px 25px',
        background: palette.grey[palette.mode === 'dark' ? 900 : 100],
        borderBottom: `1px solid ${palette.grey[palette.mode === 'dark' ? 800 : 300]}`,
        height: 'fit-content',
    })
);

const ChatTitle = styled('div')(
    ({ theme: { palette } }) => ({
        fontSize: 20,
        display: 'inline-block',
        width: 'calc(100% - 360px)',
        lineHeight: '32px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginRight: 18,
    })
);

const HeaderButton = styled(Button)(
    ({ theme }) => ({
        verticalAlign: 'top',
        padding: 0,
        marginLeft: 9,
        width: 160,
        height: 32,
    })
);

interface AreaProps {
    isEditing: boolean;
}

const MessageArea = styled('div')<AreaProps>(
    ({ theme, isEditing }) => ({
        height: isEditing ? 'calc(100vh - 60px)' : 'calc(100vh - 185px)',
        overflowY: 'scroll',
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

const ProgressContainer = styled('div')(
    ({ theme: { palette } }) => ({
        height: 125,
        padding: '10px 50px',
        textAlign: 'center',
        '& p': {
            fontSize: 20,
        },
        "& > :nth-child(2)": {
            width: '80%',
            maxWidth: 1600,
            margin: 'auto',
        },
    })
);

const NoChatIcon = styled(noChatIcon)(
    ({ theme }) => ({
        display: 'block',
        verticalAlign: 'top',
        width: 260,
        height: 260,
        margin: 'calc(50vh - 190px) auto 40px',
    })
)

const NoChatInfo = styled('p')(
    ({ theme: { palette } }) => ({
        textAlign: 'center',
        color: palette.grey[500],
        fontSize: 20,
        margin: 15,
    })
)

function ChatInterface() {

    const dispatch = useDispatch();

    const currentChat = useCurrentChatSelector();
    const { onChange, sendMessage, regenerate, onKeyDown, value } = useMessageActions(currentChat);
    const { editing, toggleEdit } = useChatEditActions(currentChat);

    const streamingMsgId = currentChat?.streamingMsgId;
    const isStreaming = !!streamingMsgId;
    const isRegenerating = isStreaming && streamingMsgId !== currentChat?.messages.at(-1)?.id;

    const scrollRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (scrollRef.current && isStreaming) {
            if (isRegenerating) scrollRef.current.scrollIntoView({ block: 'end' });
            else scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChat?.messages]);

    // Show latest message when click on a chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChat?.id]);

    if (currentChat) return (
        <ChatContainer>
            <HeaderBanner>
                <ChatTitle>{currentChat.title}</ChatTitle>
                { isStreaming || 
                    <HeaderButton variant='contained' onClick={
                        () => dispatch(
                            openModal({
                                type: ModalType.CHAT_SETTING,
                                settingId: currentChat.id,
                            })
                        )
                    }>
                        Chat Setting
                    </HeaderButton> 
                }
                { isStreaming || 
                    <HeaderButton 
                        variant='contained'
                        color={editing ? 'success' : 'warning'} 
                        onClick={toggleEdit}
                    >
                        { editing ? 'Stop Editing' : 'Edit Messages' }
                    </HeaderButton> 
                }

            </HeaderBanner>
            <MessageArea 
                isEditing={editing && !isStreaming}
                ref={isRegenerating ? null : scrollRef}
            >
                {
                    currentChat.messages.map((msg: ChatMessage) => 
                        <MessageBubble
                            key={msg.id}
                            msgId={msg.id}
                            chatId={currentChat.id}
                            msgContent={msg.editedContent || msg.content}
                            role={msg.role}
                            editMode={editing}
                            generating={msg.id === streamingMsgId}
                            forwardRef={
                                (msg.id === streamingMsgId && isRegenerating) ?
                                scrollRef : null
                            }
                        />
                    )
                }
            </MessageArea>
            {
                (editing || isStreaming) ||
                <DraftGrid>
                    <MessageInput
                        multiline
                        label='Your Message'
                        minRows={3}
                        maxRows={3}
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                    />
                    <SendButton variant='contained' onClick={sendMessage}>
                        Send
                    </SendButton>
                    <RegenerateButton variant='contained' color='success' onClick={regenerate}>
                        Regenerate
                    </RegenerateButton>
                </DraftGrid>
            }
            {
                isStreaming &&
                <ProgressContainer>
                    <p>Generating response...</p>
                    <LinearProgress />
                </ProgressContainer>
            }
        </ChatContainer>
    )
    else return (
        <ChatContainer>
            <NoChatIcon />
            <NoChatInfo>You do not have any conversations yet...</NoChatInfo>
            <NoChatInfo>Click on "New Chat" on the top left to create a new one</NoChatInfo>
        </ChatContainer>
    )
}

export default ChatInterface;