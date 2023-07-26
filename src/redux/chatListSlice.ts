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
    }
})

export default chatListSlice.reducer;
export const { setCurrentChat, addChatToList, moveChatToTop } = chatListSlice.actions;
