import { put, take, select, call } from 'redux-saga/effects';
import { moveChatToTop } from 'redux/chatListSlice';
import { addRegenerationChunk, addStreamedChunk, addUserMessage, editChatTitle } from 'redux/chatsSlice';
import { openModal } from 'redux/modalSlice';
import { AppState, ChatMessage, ModalType, SettingConfig } from 'redux/type.d';
import { requestResponse, getChatTitle, getResponseStream } from './service';

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
            responseStream.close();
            break;
        }
    }

    const chatTitle: string = yield select(
        (state: AppState) => state.chats[chatId].title
    );

    const defaultTitleRegex = /^New Conversation \d+$/;
    const { baseURL, apiKey, autoTitle }: SettingConfig = yield select(
        (state: AppState) => state.setting.global
    );

    if (autoTitle && messageHistory.length === 1 && defaultTitleRegex.test(chatTitle)) {
        const updatedMessageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => state.chats[chatId].messages
        );

        const newTitle: string = yield call(getChatTitle, updatedMessageHistory, baseURL!, apiKey!);
        if (newTitle) yield put(
            editChatTitle({
                chatId,
                newTitle,
            })
        );
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
                responseStream.close();
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
                responseStream.close();
                break;
            }
        }
    }
}