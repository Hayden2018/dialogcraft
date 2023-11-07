import { put, take, select, call } from 'redux-saga/effects';
import { moveChatToTop } from 'redux/chatListSlice';
import { addRegenerationChunk, addStreamedChunk, addUserMessage, editChatTitle } from 'redux/chatsSlice';
import { openModal } from 'redux/modalSlice';
import { AppState, ChatMessage, ModalType, SettingConfig } from 'redux/type.d';
import { requestResponse, getChatTitle } from './service';
import { EventChannel } from 'redux-saga';

type MessageChunk = {
    finish_reason?: string | null;
    finish_details?: object | null;
    delta: {
        role: string;
        content: string;
    }
}

function* handleResponseStream(responseStream: EventChannel<any>, chatId: string) {

    // Enable streaming mode
    yield put(addStreamedChunk({
        chatId,
        stop: false,
        delta: '',
    }));

    while (true) {
        const msgChunk: MessageChunk = yield take(responseStream);

        if (msgChunk.finish_reason || msgChunk.finish_details) responseStream.close();

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

        if (msgChunk.finish_reason === 'timeout') {
            yield put(openModal({ type: ModalType.CHAT_TIMEOUT }));
            yield put(addStreamedChunk({
                stop: true,
                error: true,
                delta: '',
                chatId,
            }));
            break;
        }

        if (msgChunk.finish_reason === 'interrupt') {
            yield put(addStreamedChunk({
                stop: true,
                error: false,
                delta: '',
                chatId,
            }));
            break;
        }

        yield put(addStreamedChunk({
            stop: !!(msgChunk.finish_reason || msgChunk.finish_details),
            delta: msgChunk.delta.content || '',
            chatId,
        }));
    }
}


function* handleRegenerationStream(
    responseStream: EventChannel<any>,
    chatId: string,
    msgId: string,
) {
    // Set chat to streaming mode
    yield put(addRegenerationChunk({
        stop: false,
        delta: '',
        chatId,
        msgId,
    }));

    while (true) {
        const msgChunk: MessageChunk = yield take(responseStream);

        if (msgChunk.finish_reason || msgChunk.finish_details) responseStream.close();

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

        if (msgChunk.finish_reason === 'timeout') {
            yield put(openModal({ type: ModalType.CHAT_TIMEOUT }));
            yield put(addRegenerationChunk({
                stop: true,
                error: true,
                delta: '',
                chatId,
                msgId,
            }));
            break;
        }

        if (msgChunk.finish_reason === 'interrupt') {
            yield put(addRegenerationChunk({
                stop: true,
                error: false,
                delta: '',
                chatId,
                msgId,
            }));
            break;
        }

        yield put(addRegenerationChunk({
            stop: !!(msgChunk.finish_reason || msgChunk.finish_details),
            delta: msgChunk.delta.content || '',
            chatId,
            msgId,
        }));
    }
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

    const responseStream: EventChannel<any> = yield call(requestResponse, messageHistory, chatId);
    yield call(handleResponseStream, responseStream, chatId);

    const chatTitle: string = yield select(
        (state: AppState) => state.chats[chatId].title
    );

    const defaultTitleRegex = /^New Conversation \d+$/;
    const { baseURL, apiKey, autoTitle, urlType }: SettingConfig = yield select(
        (state: AppState) => state.setting.global
    );

    if (autoTitle && messageHistory.length === 1 && defaultTitleRegex.test(chatTitle)) {
        const updatedMessageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => state.chats[chatId].messages
        );

        const newTitle: string = yield call(
            getChatTitle, 
            updatedMessageHistory, 
            baseURL!, 
            apiKey!, 
            urlType!,
        );
        
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

        const responseStream: EventChannel<any> = yield call(requestResponse, messageHistory, chatId);
        yield call(handleResponseStream, responseStream, chatId);

    } else {
        const messageHistory: Array<ChatMessage> = yield select(
            (state: AppState) => {
                const messages = state.chats[chatId].messages;
                const indexToRegenerate = messages.findIndex(({ id }) => id === msgId);
                return messages.slice(0, indexToRegenerate);
            }
        );

        const responseStream: EventChannel<any> = yield call(requestResponse, messageHistory, chatId);
        yield call(handleRegenerationStream, responseStream, chatId, msgId);     
    }
}