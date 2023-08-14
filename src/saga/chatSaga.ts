import { eventChannel } from 'redux-saga';
import { put, take, select } from 'redux-saga/effects';
import { addRegenerationChunk, addStreamedChunk, addUserMessage } from 'redux/chatsSlice';
import { AppState, ChatMessage, SettingConfig } from 'redux/type';

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

    const { chatId } = payload;

    const { temperature, topP, systemPrompt, currentModel }: SettingConfig = yield select(
        (state: AppState) => state.setting[chatId]
    );

    const messageHistory: Array<ChatMessage> = yield select(
        (state: AppState) => state.chats[chatId].messages
    );

    let messagesPayload = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.editedContent || msg.content,
    }))

    if (systemPrompt) {
        messagesPayload.unshift({
            role: 'system',
            content: systemPrompt,
        });
    }

    ipcRenderer.send('MESSAGE', {
        model: 'gpt-3.5-turbo-16k',
        apiKey: '',
        topP,
        temperature,
        messages: messagesPayload,
    });

    // Set chat to streaming mode
    yield put(addStreamedChunk({
        chatId,
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
            stop: !!msgChunk.finish_reason,
            delta: msgChunk.delta.content,
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

    const { temperature, topP, systemPrompt, currentModel }: SettingConfig = yield select(
        (state: AppState) => state.setting[chatId]
    );

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

        let messagesPayload = messageHistory.map((msg) => ({
            role: msg.role,
            content: msg.editedContent || msg.content,
        }))
    
        if (systemPrompt) {
            messagesPayload.unshift({
                role: 'system',
                content: systemPrompt,
            });
        }

        ipcRenderer.send('MESSAGE', {
            model: 'gpt-3.5-turbo-16k',
            apiKey: '',
            topP,
            temperature,
            messages: messagesPayload,
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
                    role: string,
                    content: string,
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
    } else {
        const messageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => {
                const messages = state.chats[chatId].messages;
                const indexToRegenerate = messages.findIndex(({ id }) => id === msgId);
                return messages.slice(0, indexToRegenerate);
            }
        );

        let messagesPayload = messageHistory.map((msg) => ({
            role: msg.role,
            content: msg.editedContent || msg.content,
        }))
    
        if (systemPrompt) {
            messagesPayload.unshift({
                role: 'system',
                content: systemPrompt,
            });
        }

        ipcRenderer.send('MESSAGE', {
            model: 'gpt-3.5-turbo-16k',
            apiKey: '',
            topP,
            temperature,
            messages: messagesPayload,
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
                    role: string,
                    content: string,
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
}