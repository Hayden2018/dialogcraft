import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'saga/rootSaga';
import chatListReducer from './chatListSlice';
import chatsReducer from './chatsSlice';
import modalReducer from './modalSlice';
import settingReducer from './settingSlice';

import { persistStore, persistReducer } from 'redux-persist';
import localForage from 'localforage';

const rootReducer = combineReducers({
    chatList: chatListReducer,
    chats: chatsReducer,
    modal: modalReducer,
    setting: settingReducer,
});

const persistConfig = {
    key: 'root',
    storage: localForage,
    throttle: 3000,
    serialize: false,
    deserialize: false,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: persistedReducer,
    middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);
export default store;