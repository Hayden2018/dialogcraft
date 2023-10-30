import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import { LinearProgress, TextField } from '@mui/material';
import MessageBubble from 'components/MessageBubble/MessageBubble';
import { useChatEditActions, useCurrentChatSelector, useMessageActions } from './ChatInterface.hook';
import { ChatMessage, ModalType } from 'redux/type.d';
import { useEffect, useRef } from 'react';
import { ReactComponent as noChatIcon } from './noChat.svg';
import { ReactComponent as menuIcon } from './menuIcon.svg';
import { useDispatch } from 'react-redux';
import { openModal } from 'redux/modalSlice';
import { useScreenWidth } from 'utils';
import { createNewChat } from 'redux/chatsSlice';
import { v4 as uuidv4 } from 'uuid';
import { addChatToList } from 'redux/chatListSlice';
import { addSetting } from 'redux/settingSlice';


const ChatContainer = styled('div')(
    ({ theme: { breakpoints } }) => ({
        display: 'inline-block',
        height: '100%',
        width: 'calc(100% - 360px)',
        minWidth: '65%',
        verticalAlign: 'top',
        position: 'relative',
        [breakpoints.down(800)]: {
            width: '100%',
        },
    })
);

const HeaderBanner = styled('div')(
    ({ theme: { palette, breakpoints } }) => ({
        padding: '10px 15px 10px 20px',
        background: palette.grey[palette.mode === 'dark' ? 900 : 100],
        borderBottom: `1px solid ${palette.grey[palette.mode === 'dark' ? 800 : 300]}`,
        display: 'grid',
        gridTemplateColumns: 'calc(100% - 340px) 160px 160px',
        gridTemplateRows: '32px',
        gridGap: '10px',
        [breakpoints.down(600)]: {
            padding: '8px 16px 10px',
            gridTemplateColumns: 'calc(50% - 4px) calc(50% - 4px)',
            gridTemplateRows: '32px 32px',
            gridGap: '8px',
        },
    })
);

const ChatTitle = styled('div')(
    ({ theme: { breakpoints } }) => ({
        fontSize: 20,
        width: 'calc(100% - 15px)',
        lineHeight: '32px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        [breakpoints.down(600)]: {
            width: '100%',
            gridColumn: '1 / 3',
            gridRow: '1',
        },
    })
);

const HeaderButton = styled(Button)(
    ({ theme: { breakpoints } }) => ({
        width: 160,
        height: 32,
        [breakpoints.down(600)]: {
            width: '100%',
        },
    })
);

const StopGenerationButton = styled(Button)(
    ({ theme: { breakpoints } }) => ({
        gridColumn: '2 / 4',
        justifySelf: 'right',
        width: 200,
        height: 32,
        [breakpoints.down(800)]: {
            gridColumn: '1 / 3',
            width: '100%',
        },
    })
);

interface AreaProps {
    isEditing: boolean;
}

const MessageArea = styled('div')<AreaProps>(
    ({ theme, isEditing }) => ({
        overflowY: 'scroll',
        height: isEditing ? 'calc(100% - 55px)' : 'calc(100% - 175px)',
        '& > :first-child': {
            marginTop: '12px',
        },  
        '& > :last-child': {
            marginBottom: '4px',
        },
        [theme.breakpoints.down(800)]: {
            height: isEditing ? 'calc(100% - 55px)' : 'calc(100% - 205px)',
        },
        [theme.breakpoints.down(600)]: {
            height: isEditing ? 'calc(100% - 95px)' : 'calc(100% - 240px)',
        },
    })
);

const DraftGrid = styled('div')(
    ({ theme: { breakpoints } }) => ({
        height: 102,
        margin: '10px',
        display: 'grid',
        gridTemplateColumns: 'calc(100% - 175px) 175px',
        gridTemplateRows: '45px 45px',
        gridGap: '8px',
        [breakpoints.down(800)]: {
            height: 130,
            gridGap: '10px',
            margin: '9px 12px',
            gridTemplateColumns: 'calc(50% - 30px) calc(50% - 30px) 40px',
            gridTemplateRows: '40px 80px',
        },
    })
)

const MessageInput = styled(TextField)(
    ({ theme: { breakpoints } }) => ({
        gridColumn: '1',
        gridRow: '1 / span 2',
        [breakpoints.down(800)]: {
            gridColumn: '1 / 4',
            gridRow: '2',
        },
    })
);

const SendButton = styled(Button)(
    ({ theme: { breakpoints } }) => ({
        width: 165,
        height: 45,
        gridColumn: '2',
        gridRow: '1',
        [breakpoints.down(800)]: {
            gridColumn: '2',
            gridRow: '1',
            height: 38,
            width: '100%',
        },
    })
);

const RegenerateButton = styled(Button)(
    ({ theme: { breakpoints } }) => ({
        width: 165,
        height: 45,
        gridColumn: '2',
        gridRow: '2',
        [breakpoints.down(800)]: {
            gridColumn: '1',
            gridRow: '1',
            height: 38,
            width: '100%',
        },
    })
);

const MenuIcon = styled(menuIcon)(
    ({ theme }) => ({
        width: 30,
        height: 30,
        margin: '5px 5px 5px 3px',
        gridColumn: '3',
        gridRow: '1',
        cursor: 'pointer',
    })
)

const ProgressContainer = styled('div')(
    ({ theme }) => ({
        height: 120,
        padding: '8px 50px',
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
        margin: 'calc(50vh - 220px) auto 30px',
    })
);

const StartNewChatButton = styled(Button)(
    ({ theme }) => ({
        display: 'block',
        width: 200,
        height: 40,
        margin: '20px auto',
    })
);

const NoChatInfo = styled('p')(
    ({ theme: { palette } }) => ({
        textAlign: 'center',
        color: palette.grey[500],
        fontSize: 20,
        margin: 15,
    })
);

function ChatInterface({ setMenuOpen }: { setMenuOpen: React.Dispatch<React.SetStateAction<boolean>> }) {

    const dispatch = useDispatch();
    const screenWidth = useScreenWidth();
    const currentChat = useCurrentChatSelector();
    const { onChange, sendMessage, regenerate, onKeyDown, stopGenerate, value } = useMessageActions(currentChat);
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
    }, [currentChat?.messages, isRegenerating, isStreaming]);

    // Show latest message when click on a chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [currentChat?.id]);

    const startNewChat = () => {
        const newChatId = uuidv4();
        dispatch(createNewChat({
            title: 'New Conversation 1',
            chatId: newChatId,
        }));
        dispatch(addChatToList(newChatId));
        dispatch(addSetting({ settingId : newChatId }));
    }

    if (currentChat) return (
        <ChatContainer>
            <HeaderBanner>
                <ChatTitle>{currentChat.title}</ChatTitle>
                { isStreaming ? 
                    <StopGenerationButton
                        color='error' 
                        variant='contained'
                        onClick={stopGenerate}
                    >
                        Stop Generation
                    </StopGenerationButton>       
                    :
                    <>
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
                        <HeaderButton 
                            variant='contained'
                            color={editing ? 'success' : 'warning'} 
                            onClick={toggleEdit}
                        >
                            { editing ? 'Stop Editing' : 'Edit Messages' }
                        </HeaderButton>
                    </> 
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
                            editMode={editing && !isStreaming}
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
                        rows={screenWidth < 800 ? 2 : 3}
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
                    {
                        screenWidth < 800 && <MenuIcon onClick={() => setMenuOpen(true)} />
                    }
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
            <NoChatInfo>You do not have any conversations.</NoChatInfo>
            <StartNewChatButton variant='contained' onClick={startNewChat}>
                Start New Chat
            </StartNewChatButton>
        </ChatContainer>
    )
}

export default ChatInterface;