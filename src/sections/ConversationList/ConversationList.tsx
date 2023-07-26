import Button from '@mui/material/Button';
import { useDispatch }  from 'react-redux';
import { useConversationSelector } from './ConversationList.hook';
import { createNewChat } from 'redux/chatsSlice';
import { v4 as uuidv4 } from 'uuid';
import { addChatToList } from 'redux/chatListSlice';
import { styled } from '@mui/system';

const ChatListContainer = styled('div')(
    ({ theme }) => ({
        display: 'inline-block',
        height: '100vh',
        width: '20%',
        minWidth: 180,
    })
);

function ConversationList() {

    const dispatch = useDispatch();
    const conversations = useConversationSelector();
    return (
        <ChatListContainer>
            <Button variant="contained" onClick={() => {
                const newChatId = uuidv4();
                dispatch(createNewChat(newChatId));
                dispatch(addChatToList(newChatId));
            }}>
                New Chat
            </Button>
            {
                conversations.map(({ title, chatId }) => <p key={chatId}>{title}</p>)
            }
        </ChatListContainer>
    );
}

export default ConversationList;