import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'saga/rootSaga';
import chatListReducer from './chatListSlice';
import chatsReducer from './chatsSlice';
import modalReducer from './modalSlice';

const rootReducer = combineReducers({
    chatList: chatListReducer,
    chats: chatsReducer,
    modal: modalReducer,
});

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export default store;