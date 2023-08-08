import Button from '@mui/material/Button';
import { useDispatch }  from 'react-redux';
import { useConversationSelector } from './ConversationList.hook';
import { createNewChat } from 'redux/chatsSlice';
import { v4 as uuidv4 } from 'uuid';
import { addChatToList } from 'redux/chatListSlice';
import { styled } from '@mui/system';
import ChatTitleBox from 'components/ChatTitleBox/ChatTitleBox';

const ChatListContainer = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: '22%',
        borderRight: `1px solid ${theme.palette.grey[800]}`,
        background: theme.palette.grey[900],
    })
);

const NewChatButton = styled(Button)(
    ({ theme }) => ({
        display: 'block',
        margin: '12px auto',
        width: 170,
        height: 36,
        padding: 0,
    })
);

function ConversationList() {

    const dispatch = useDispatch();
    const { chatOrder, currentChatId } = useConversationSelector();
    return (
        <ChatListContainer>
            <NewChatButton variant="contained" onClick={() => {
                const newChatId = uuidv4();
                dispatch(createNewChat(newChatId));
                dispatch(addChatToList(newChatId));
            }}>
                New Chat
            </NewChatButton>
            {
                chatOrder.map((chatId) => <ChatTitleBox chatId={chatId} isCurrent={chatId === currentChatId} key={chatId} />)
            }
        </ChatListContainer>
    );
}

export default ConversationList;