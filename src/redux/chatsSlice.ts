import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatRecords, Chat } from 'redux/type';

const initialState: ChatRecords = { };

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        createNewChat(chats, { payload: chatId }: PayloadAction<string>) {
            chats[chatId] = {
                messages: [],
                title: 'Unnamed Conversation',
                id: chatId,
            };
            return chats
        },
        addUserMessage(chats, { payload }) {
            const { chatId, messageContent } = payload;
            chats[chatId].messages.push({
                time: new Date(),
                role: 'user',
                markdown: messageContent,
                editedMessage: '',
            });
            return chats
        },
    }
})

export default chatsSlice.reducer;
export const { createNewChat, addUserMessage } = chatsSlice.actions;