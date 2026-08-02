import { createSlice } from '@reduxjs/toolkit';
import { Chat } from 'redux/type';
import { v4 as uuidv4 } from 'uuid';

const initialState: Record<string, Chat> = {};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    createNewChat(chats, { payload }) {
      const { chatId, title } = payload;
      chats[chatId] = {
        id: chatId,
        messages: [],
        title: title,
        streamingMsgId: null,
        rollbackMessage: null,
      };
      return chats;
    },
    addUserMessage(chats, { payload }) {
      const { chatId, messageContent } = payload;
      chats[chatId].messages.push({
        id: uuidv4(),
        time: new Date().getTime(),
        role: 'user',
        content: messageContent,
        editedContent: '',
        reasoning: '',
      });
      return chats;
    },
    addStreamedChunk(chats, { payload }) {
      const { chatId, delta = '', reasoningDelta = '', stop, error } = payload;
      const targetChat = chats[chatId];
      if (targetChat.streamingMsgId) {
        if (stop) {
          targetChat.streamingMsgId = null;
          if (error) targetChat.messages.pop();
        } else {
          const lastMessage = targetChat.messages.at(-1)!;
          lastMessage.content += delta;
          lastMessage.reasoning = (lastMessage.reasoning || '') + reasoningDelta;
        }
      } else {
        const messageId = uuidv4();
        targetChat.streamingMsgId = messageId;
        targetChat.messages.push({
          id: messageId,
          time: new Date().getTime(),
          role: 'assistant',
          content: delta,
          editedContent: '',
          reasoning: reasoningDelta,
        });
      }
      chats[chatId] = targetChat;
      return chats;
    },
    addRegenerationChunk(chats, { payload }) {
      const { chatId, msgId, delta = '', reasoningDelta = '', stop, error } = payload;
      const targetChat = chats[chatId];
      const targetMsgIndex = targetChat.messages.findIndex((msg) => msg.id === msgId);
      if (targetChat.streamingMsgId) {
        if (stop) {
          targetChat.streamingMsgId = null;
          if (error) {
            targetChat.messages[targetMsgIndex] = targetChat.rollbackMessage!;
            targetChat.rollbackMessage = null;
          }
        } else {
          const targetMessage = targetChat.messages[targetMsgIndex]!;
          targetMessage.content += delta;
          targetMessage.reasoning = (targetMessage.reasoning || '') + reasoningDelta;
        }
      } else {
        targetChat.streamingMsgId = msgId;
        targetChat.rollbackMessage = targetChat.messages[targetMsgIndex];
        targetChat.messages[targetMsgIndex] = {
          id: msgId,
          time: new Date().getTime(),
          role: 'assistant',
          content: delta,
          editedContent: '',
          reasoning: reasoningDelta,
        };
      }
      chats[chatId] = targetChat;
      return chats;
    },
    stopStreaming(chats, { payload }) {
      const { chatId } = payload;
      chats[chatId].streamingMsgId = null;
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
    restoreMessage(chats, { payload }) {
      const { chatId, msgId } = payload;
      const targetChat = chats[chatId];
      const targetMsgIndex = targetChat.messages.findIndex(({ id }) => id === msgId);
      const targetMessage = targetChat.messages[targetMsgIndex];
      targetMessage.editedContent = '';
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
      delete chats[chatId];
      return chats;
    },
    setChats(_, { payload }) {
      return payload;
    },
    resetChats() {
      return {};
    },
  },
});

export default chatsSlice.reducer;
export const {
  createNewChat,
  addUserMessage,
  addStreamedChunk,
  addRegenerationChunk,
  stopStreaming,
  editChatTitle,
  editMessage,
  restoreMessage,
  deleteChat,
  deleteMessage,
  resetChats,
  setChats,
} = chatsSlice.actions;
