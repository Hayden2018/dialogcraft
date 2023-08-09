import { createSlice } from '@reduxjs/toolkit'
import { ChatRecords } from 'redux/type';
import { v4 as uuidv4 } from 'uuid';

const initialState: ChatRecords = { };

const chatsSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {
        createNewChat(chats, { payload: chatId }) {
            chats[chatId] = {
                messages: [],
                title: `New Conversation ${Object.keys(chats).length + 1}`,
                streaming: false,
                id: chatId,
            };
            return chats
        },
        addUserMessage(chats, { payload }) {
            const { chatId, messageContent } = payload;
            chats[chatId].messages.push({
                id: uuidv4(),
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
                    id: uuidv4(),
                    time: new Date(),
                    role: 'assistant',
                    content: delta,
                    editedContent: '',
                });
            }
            chats[chatId] = targetChat;
            return chats;
        },
        editMessage(chats, { payload }) {
            const { chatId, msgId, newContent } = payload;
            const targetChat = chats[chatId];
            const targetMsgIndex = targetChat.messages.findIndex(({ id }) => id === msgId);
            const targetMessage = targetChat.messages[targetMsgIndex];
            targetMessage.editedContent = newContent.trim();
            targetChat.messages[targetMsgIndex] = targetMessage;
            chats[chatId] = targetChat;
            return chats;
        },
        deleteMessage(chats, { payload }) {
            const { chatId, msgId } = payload;
            const messages = chats[chatId].messages;
            const indexToDelete = messages.findIndex(({ id }) => id === msgId);
            messages.splice(indexToDelete, 1);
            chats[chatId].messages = messages;
            return chats;
        },
        editChatTitle(chats, { payload }) {
            const { chatId, newTitle } = payload;
            chats[chatId].title = newTitle;
            return chats;
        },
        deleteChat(chats, { payload: chatId }) {
            delete chats[chatId]
            return chats;
        },
    }
})

export default chatsSlice.reducer;
export const { 
    createNewChat,
    addUserMessage,
    addStreamedChunk,
    editChatTitle,
    editMessage,
    deleteChat,
    deleteMessage,
} = chatsSlice.actions;