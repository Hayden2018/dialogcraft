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

const Container = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: 345,
        borderRight: `1px solid ${theme.palette.grey[800]}`,
        background: theme.palette.grey[900],
    })
);

const ChatListContainer = styled('div')(
    ({ theme }) => ({
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
    })
);

const ButtonContainer = styled('div')(
    ({ theme }) => ({
        margin: '12px 0px 8px'
    })
);

const ListButton = styled(Button)(
    ({ theme }) => ({
        display: 'block',
        margin: '8px auto',
        width: 180,
        height: 32,
        padding: 0,
    })
);

function ConversationList() {

    const dispatch = useDispatch();
    const { chatOrder, currentChatId } = useConversationSelector();
    return (
        <Container>
            <ButtonContainer>
                <ListButton
                    variant='contained'
                    onClick={() => dispatch(openModal({ type: ModalType.GLOBAL_SETTING }))}
                >
                    Setting
                </ListButton>
                <ListButton variant='contained' color='success' onClick={() => {
                    const newChatId = uuidv4();
                    dispatch(createNewChat(newChatId));
                    dispatch(addChatToList(newChatId));
                    dispatch(addSetting({ settingId : newChatId }));
                }}>
                    New Chat
                </ListButton>
            </ButtonContainer>


            <ChatListContainer>
                {
                    chatOrder.map((chatId) => <ChatTitleBox chatId={chatId} isCurrent={chatId === currentChatId} key={chatId} />)
                }
            </ChatListContainer>
        </Container>
    );
}

export default ConversationList;