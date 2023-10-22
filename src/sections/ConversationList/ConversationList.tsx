import Button from '@mui/material/Button';
import { useDispatch }  from 'react-redux';
import { useConversationSelector } from './ConversationList.hook';
import { createNewChat } from 'redux/chatsSlice';
import { v4 as uuidv4 } from 'uuid';
import { addChatToList } from 'redux/chatListSlice';
import { styled } from '@mui/system';
import ChatTitleBox from 'components/ChatTitleBox/ChatTitleBox';
import { addSetting } from 'redux/settingSlice';
import { openModal } from 'redux/modalSlice';
import { ModalType } from 'redux/type.d';
import { useScreenWidth } from 'utils';

interface ContainerProps {
    menuOpen: boolean;
}

const Container = styled('div')<ContainerProps>(
    ({ menuOpen, theme: { palette, breakpoints } }) => ({
        display: 'inline-block',
        height: '100%',
        maxWidth: '360px',
        width: '35%',
        borderRight: `1px solid ${palette.grey[palette.mode === 'dark' ? 800 : 300]}`,
        background: palette.grey[palette.mode === 'dark' ? 900 : 100],
        [breakpoints.down(800)]: {
            position: 'fixed',
            borderRight: 'unset',
            maxWidth: 'unset',
            width: '100%',
            transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.2s',
            zIndex: 5,
        },
    })
);

const ChatListContainer = styled('div')(
    ({ theme: { breakpoints } }) => ({
        height: 'calc(100% - 100px)',
        overflowY: 'auto',
        '& > :first-child': {
            marginTop: '0px',
        },  
        '& > :last-child': {
            marginBottom: '0px',
        },
        [breakpoints.down(800)]: {
            height: 'calc(100% - 108px)',
            marginTop: '10px',
        },
    })
);

const ButtonContainer = styled('div')(
    ({ theme: { breakpoints } }) => ({
        margin: '10px auto',
        display: 'grid',
        gridTemplateColumns: '100%',
        gridTemplateRows: '32px',
        gridGap: '8px',
        justifyItems: 'center',
        [breakpoints.down(800)]: {
            maxWidth: '500px',
            gridTemplateColumns: 'calc(50% - 4px) calc(50% - 4px)',
            gridTemplateRows: '35px',
        },
        [breakpoints.down(520)]: {
            margin: '10px',
        },
    })
);

const ListButton = styled(Button)(
    ({ theme: { breakpoints } }) => ({
        width: 180,
        height: 32,
        padding: 0,
        [breakpoints.down(800)]: {
            width: '100%',
            height: 35,
        },
    })
);

function ConversationList({
    menuOpen,
    setMenuOpen,
}: {
    menuOpen: boolean,
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>> 
}) {
    const dispatch = useDispatch();
    const screenWidth = useScreenWidth();
    const onMobile = screenWidth < 800;
    const { chatOrder, currentChatId, incrementer } = useConversationSelector();

    const startNewChat = () => {
        const newChatId = uuidv4();
        dispatch(createNewChat({
            title: `New Conversation ${incrementer}`,
            chatId: newChatId,
        }));
        dispatch(addChatToList(newChatId));
        dispatch(addSetting({ settingId : newChatId }));
        onMobile && setMenuOpen(false);
    }

    return (
        <Container menuOpen={menuOpen}>
            {
                onMobile &&
                <ChatListContainer>
                    {
                        chatOrder.map((chatId) => 
                            <ChatTitleBox
                                key={chatId}
                                chatId={chatId}
                                isCurrent={chatId === currentChatId}
                                setMenuOpen={setMenuOpen}
                            />
                        )
                    }
                </ChatListContainer>
            }
            <ButtonContainer>
                <ListButton
                    variant='contained'
                    onClick={() => dispatch(openModal({ type: ModalType.GLOBAL_SETTING }))}
                >
                    Setting
                </ListButton>
                <ListButton variant='contained' color='success' onClick={startNewChat}>
                    New Chat
                </ListButton>
                {
                    screenWidth < 800 &&
                    <ListButton
                        color='warning'
                        variant='contained'
                        onClick={() => setMenuOpen(false)}
                        style={{
                            gridColumn: '1 / 3',
                            justifySelf: 'center',
                        }}
                    >
                        Back to Chat
                    </ListButton>
                }
            </ButtonContainer>
            {
                onMobile ||
                <ChatListContainer>
                    {
                        chatOrder.map((chatId) => 
                            <ChatTitleBox
                                key={chatId}
                                chatId={chatId}
                                isCurrent={chatId === currentChatId} 
                            />
                        )
                    }
                </ChatListContainer>
            }
        </Container>
    );
}

export default ConversationList;