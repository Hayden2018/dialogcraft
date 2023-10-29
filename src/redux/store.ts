import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from 'saga/rootSaga';
import chatListReducer from './chatListSlice';
import chatsReducer from './chatsSlice';
import modalReducer from './modalSlice';
import pageReducer from './pageSlice';
import settingReducer from './settingSlice';
import migrations from './migration';

import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import localForage from 'localforage';

const rootReducer = combineReducers({
    chatList: chatListReducer,
    chats: chatsReducer,
    modal: modalReducer,
    page: pageReducer,
    setting: settingReducer,
});

const persistConfig = {
    key: 'root',
    version: 0,
    storage: localForage,
    throttle: 3000,
    serialize: false,
    deserialize: false,
    blacklist: ['modal'],
    migrate: createMigrate(migrations as any),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: persistedReducer,
    middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);