import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatList } from 'redux/type';

const initialState: ChatList = {
    chatOrder: [],
    currentChatId: '',
}

const chatListSlice = createSlice({
    name: 'chatList',
    initialState,
    reducers: {
        setCurrentChat(chatList, { payload: chatId }: PayloadAction<string>) {
            chatList.currentChatId = chatId;
            return chatList;
        },
        addChatToList(chatList, { payload: chatId }: PayloadAction<string>) {
            chatList.chatOrder = [chatId, ...chatList.chatOrder];
            chatList.currentChatId = chatId;
            return chatList;
        },
        moveChatToTop(chatList, { payload: chatId }: PayloadAction<string>) {
            chatList.chatOrder.unshift(chatId);
            return chatList;
        },
        removeFromList(chatList, { payload: chatId }: PayloadAction<string>) {
            chatList.chatOrder = chatList.chatOrder.filter((cid) => cid !== chatId);
            if (chatId === chatList.currentChatId) {
                chatList.currentChatId = chatList.chatOrder[0] || '';
            }
            return chatList;
        },
    }
})

export default chatListSlice.reducer;
export const {
    setCurrentChat,
    addChatToList,
    moveChatToTop,
    removeFromList,
} = chatListSlice.actions;
