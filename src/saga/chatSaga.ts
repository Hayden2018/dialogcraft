import { eventChannel } from 'redux-saga';
import { put, take, select } from 'redux-saga/effects';
import { addRegenerationChunk, addStreamedChunk, addUserMessage } from 'redux/chatsSlice';
import { AppState, ChatMessage } from 'redux/type';

const { ipcRenderer } = window.require('electron');

function getResponseStream() {
    return eventChannel(
        (emit) => {
            ipcRenderer.on('STREAM', (event: unknown, data: any) => {
                emit(data);
            });
            return () => {};
        }
    );
}

export function* handleUserMessage({ payload } : 
    {
        payload: { chatId: string, messageContent: string }, 
        type: string 
    }
) {
    yield put(addUserMessage(payload));
    const messageHistory: Array<ChatMessage> = yield select(
        (state: AppState) => state.chats[payload.chatId].messages
    );
    ipcRenderer.send('MESSAGE', {
        model: 'gpt-3.5-turbo-16k',
        apiKey: '',
        messages: messageHistory.map((msg) => ({
            role: msg.role,
            content: msg.editedContent || msg.content,
        })),
    });

    // Set chat to streaming mode
    yield put(addStreamedChunk({
        chatId: payload.chatId,
        stop: false,
        delta: '',
    }));

    const responseStream = getResponseStream();
    while (true) {
        const msgChunk: {
            finish_reason: string | null;
            delta: {
                role: string;
                content: string;
            }
        } = yield take(responseStream);

        yield put(addStreamedChunk({
            chatId: payload.chatId,
            stop: !!msgChunk.finish_reason,
            delta: msgChunk.delta.content,
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
    const messageHistory: Array<ChatMessage> = yield select(
        (state: AppState) => {
            const messages = state.chats[chatId].messages;
            const indexToRegenerate = messages.findIndex(({ id }) => id === msgId);
            return messages.slice(0, indexToRegenerate);
        }
    );
    ipcRenderer.send('MESSAGE', {
        model: 'gpt-3.5-turbo-16k',
        apiKey: '',
        messages: messageHistory.map((msg) => ({
            role: msg.role,
            content: msg.editedContent || msg.content,
        })),
    });

    // Set chat to streaming mode
    yield put(addRegenerationChunk({
        stop: false,
        delta: '',
        chatId,
        msgId,
    }));

    const responseStream = getResponseStream();
    while (true) {
        const msgChunk: {
            finish_reason: string | null;
            delta: {
                role: string;
                content: string;
            }
        } = yield take(responseStream);

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