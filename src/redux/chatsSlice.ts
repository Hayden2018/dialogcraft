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
                streaming: false,
                id: chatId,
            };
            return chats
        },
        addUserMessage(chats, { payload }) {
            const { chatId, messageContent } = payload;
            chats[chatId].messages.push({
                time: new Date(),
                role: 'user',
                content: messageContent,
                editedContent: '',
            });
            return chats
        },
        addStreamedChunk(chats, { payload }) {
            const { chatId, delta, stop } = payload;
            const targetChat = chats[chatId];
            if (targetChat.streaming) {
                if (stop) targetChat.streaming = false;
                else targetChat.messages.at(-1)!.content += delta;
            } else {
                targetChat.streaming = true;
                targetChat.messages.push({
                    time: new Date(),
                    role: 'assistant',
                    content: delta,
                    editedContent: '',
                });
            }
            chats[chatId] = targetChat;
            return chats;
        },
    }
})


export default chatsSlice.reducer;
export const { createNewChat, addUserMessage, addStreamedChunk } = chatsSlice.actions;