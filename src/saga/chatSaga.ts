import { eventChannel } from 'redux-saga';
import { put, take, select } from 'redux-saga/effects';
import { addStreamedChunk, addUserMessage } from 'redux/chatsSlice';
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
            stop: !!msgChunk.finish_reason,
            delta: msgChunk.delta.content,
            chatId: payload.chatId,
        }));

        if (!!msgChunk.finish_reason) {
            break;
        }
    }
}