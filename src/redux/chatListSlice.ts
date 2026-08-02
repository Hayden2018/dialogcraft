import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatList } from 'redux/type';

const initialState: ChatList = {
  currentChatId: '',
  incrementer: 1,
  chatOrder: [],
};

const chatListSlice = createSlice({
  name: 'chatList',
  initialState,
  reducers: {
    setCurrentChat(chatList, { payload: chatId }: PayloadAction<string>) {
      chatList.currentChatId = chatId;
    },
    addChatToList(chatList, { payload: chatId }: PayloadAction<string>) {
      chatList.chatOrder = [chatId, ...chatList.chatOrder];
      chatList.currentChatId = chatId;
      chatList.incrementer += 1;
    },
    moveChatToTop(chatList, { payload: chatId }: PayloadAction<string>) {
      chatList.chatOrder = chatList.chatOrder.filter((cid) => cid !== chatId);
      chatList.chatOrder.unshift(chatId);
    },
    removeFromList(chatList, { payload: chatId }: PayloadAction<string>) {
      chatList.chatOrder = chatList.chatOrder.filter((cid) => cid !== chatId);
      if (chatId === chatList.currentChatId) {
        chatList.currentChatId = chatList.chatOrder[0] || '';
      }
    },
    resetChatList() {
      return {
        currentChatId: '',
        incrementer: 1,
        chatOrder: [],
      };
    },
    setChatList(_, { payload }) {
      return payload;
    },
  },
});

export default chatListSlice.reducer;
export const { setCurrentChat, addChatToList, moveChatToTop, removeFromList, resetChatList, setChatList } =
  chatListSlice.actions;
