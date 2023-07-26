import { combineReducers, configureStore } from '@reduxjs/toolkit';

import chatListReducer from './chatListSlice';
import chatsReducer from './chatsSlice';

const rootReducer = combineReducers({
    chatList: chatListReducer,
    chats: chatsReducer,
});

const store = configureStore({ reducer: rootReducer });

export default store;