// **** This file is for Electron environment only **** 

import { put, take, select, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { v4 as uuidv4 } from 'uuid';
import { moveChatToTop } from 'redux/chatListSlice';
import { addRegenerationChunk, addStreamedChunk, addUserMessage } from 'redux/chatsSlice';
import { openModal } from 'redux/modalSlice';
import { AppState, ChatMessage, ModalType, SettingConfig } from 'redux/type.d';

const { ipcRenderer = null } = window.isElectron ? window.require('electron') : { };

function getResponseStream(requestId: string) {
    return eventChannel(
        (emit) => {
            ipcRenderer.on(requestId, (event: unknown, data: any) => {
                emit(data);
            });
            return () => {};
        }
    );
}

function* requestResponse(messageHistory: Array<ChatMessage>, chatId: string) {

    const { 
        temperature,
        topP,
        systemPrompt,
        currentModel,
        maxContext,
    }: SettingConfig = yield select(
        (state: AppState) => state.setting[chatId]
    );

    const { baseURL, apiKey }: SettingConfig = yield select(
        (state: AppState) => state.setting.global
    );

    let messagesPayload = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.editedContent || msg.content,
    }));

    if (systemPrompt) {
        messagesPayload.unshift({
            role: 'system',
            content: systemPrompt,
        });
    }

    if (messagesPayload.length > maxContext) {
        messagesPayload = messagesPayload.slice(-maxContext);
    }

    const requestId = uuidv4();

    ipcRenderer.send('MESSAGE', {
        baseURL,
        apiKey,
        topP,
        temperature,
        model: currentModel,
        messages: messagesPayload,
        requestId,
    });

    return requestId;
}


export function* handleUserMessage({ payload } : 
    {
        payload: { chatId: string, messageContent: string }, 
        type: string
    }
) {
    const { chatId } = payload;

    yield put(addUserMessage(payload));
    yield put(moveChatToTop(chatId));

    const messageHistory: Array<ChatMessage> = yield select(
        (state: AppState) => state.chats[chatId].messages
    );

    const requestId: string = yield call(requestResponse, messageHistory, chatId);

    // Enable streaming mode
    yield put(addStreamedChunk({
        chatId,
        stop: false,
        delta: '',
    }));

    const responseStream = getResponseStream(requestId);
    while (true) {
        const msgChunk: {
            finish_reason: string | null;
            delta: {
                role?: string;
                content?: string;
            }
        } = yield take(responseStream);

        if (msgChunk.finish_reason === 'error') {
            yield put(openModal({ type: ModalType.CHAT_ERROR }));
            yield put(addStreamedChunk({
                stop: true,
                error: true,
                delta: '',
                chatId,
            }));
            break;
        }

        yield put(addStreamedChunk({
            stop: !!msgChunk.finish_reason,
            delta: msgChunk.delta.content,
            error: false,
            chatId,
        }));

        if (!!msgChunk.finish_reason) {
            break;
        }
    }
}


export function* handleRegenerate({ payload } : 
    {
        payload: { chatId: string, msgId: string },
        type: string 
    }
) {
    const { chatId, msgId } = payload;
    
    const messageRole: string = yield select(
        (state: AppState) => {
            const messages = state.chats[chatId].messages;
            const targetMessage = messages.find(({ id }) => id === msgId);
            return targetMessage!.role;
        }
    );

    // The message to regenerate is sent by the user
    // Happens only when user press regenerate after deleting last message by assistant
    if (messageRole !== 'assistant') {

        const messageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => state.chats[chatId].messages
        );

        const requestId: string = yield call(requestResponse, messageHistory, chatId);

        // Set chat to streaming mode
        yield put(addStreamedChunk({
            chatId: payload.chatId,
            stop: false,
            delta: '',
        }));

        const responseStream = getResponseStream(requestId);
        while (true) {
            const msgChunk: {
                finish_reason: string | null;
                delta: {
                    role: string,
                    content: string,
                }
            } = yield take(responseStream);

            if (msgChunk.finish_reason === 'error') {
                yield put(openModal({ type: ModalType.CHAT_ERROR }));
                yield put(addStreamedChunk({
                    stop: true,
                    error: true,
                    delta: '',
                    chatId,
                }));
                break;
            }

            yield put(addStreamedChunk({
                chatId: payload.chatId,
                stop: !!msgChunk.finish_reason,
                delta: msgChunk.delta.content,
            }));

            if (!!msgChunk.finish_reason) {
                break;
            }
        }
    } else {
        const messageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => {
                const messages = state.chats[chatId].messages;
                const indexToRegenerate = messages.findIndex(({ id }) => id === msgId);
                return messages.slice(0, indexToRegenerate);
            }
        );

        const requestId: string = yield call(requestResponse, messageHistory, chatId);

        // Set chat to streaming mode
        yield put(addRegenerationChunk({
            stop: false,
            delta: '',
            chatId,
            msgId,
        }));

        const responseStream = getResponseStream(requestId);
        while (true) {
            const msgChunk: {
                finish_reason: string | null;
                delta: {
                    role: string,
                    content: string,
                }
            } = yield take(responseStream);

            if (msgChunk.finish_reason === 'error') {
                yield put(openModal({ type: ModalType.CHAT_ERROR }));
                yield put(addRegenerationChunk({
                    stop: true,
                    error: true,
                    delta: '',
                    chatId,
                    msgId,
                }));
                break;
            }

            yield put(addRegenerationChunk({
                stop: !!msgChunk.finish_reason,
                delta: msgChunk.delta.content,
                chatId,
                msgId,
            }));

            if (!!msgChunk.finish_reason) {
                break;
            }
        }
    }
}