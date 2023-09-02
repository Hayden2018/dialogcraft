import { put, select, call } from 'redux-saga/effects';
import { openModal } from 'redux/modalSlice';
import { moveChatToTop } from 'redux/chatListSlice';
import { addRegenerationChunk, addStreamedChunk, addUserMessage, editChatTitle } from 'redux/chatsSlice';
import { AppState, ChatMessage, ModalType, SettingConfig } from 'redux/type.d';
import { chatTitlePrompt } from 'utils';

// **** This file is for Browser environment only **** 

async function getResponse(payload: any) {
    const{ baseURL, apiKey } = payload;
    delete payload.baseURL;
    delete payload.apiKey;
    try {
        const response = await fetch(`${baseURL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
        });
    
        const data = await response.json();
        return { error: false, data };

    } catch (error) {
        return { error: true };
    }
}


async function getChatTitle(messageHistory: Array<ChatMessage>, baseURL:string, apiKey: string) {
    try {
        const response = await fetch(`${baseURL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                temperature: 0.5,
                messages: [
                    ...messageHistory.map(
                        (msg) => ({
                            role: msg.role,
                            content: msg.editedContent || msg.content,
                        })
                    ),
                    {
                        role: 'user',
                        content: chatTitlePrompt,
                    }
                ]
            }),
        });
    
        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        return '';
    }
}


export function* handleBrowserUserMessage({ payload } : 
    {
        payload: { chatId: string, messageContent: string }, 
        type: string
    }
) {
    const { chatId } = payload;

    yield put(addUserMessage(payload));
    yield put(moveChatToTop(chatId));

    const { 
        temperature,
        topP,
        systemPrompt,
        currentModel,
        maxContext,
    }: SettingConfig = yield select(
        (state: AppState) => state.setting[chatId]
    );

    const { baseURL, apiKey, autoTitle }: SettingConfig = yield select(
        (state: AppState) => state.setting.global
    );

    const messageHistory: Array<ChatMessage> = yield select(
        (state: AppState) => state.chats[chatId].messages
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

    // Add placeholder
    yield put(addStreamedChunk({
        chatId,
        stop: false,
        delta: '',
    }));

    const { error, data }: { error: boolean, data: any } = yield call(getResponse, {
        messages: messagesPayload,
        model: currentModel,
        top_p: topP,
        baseURL,
        apiKey,
        temperature,
    });

    if (error) {
        yield put(openModal({ type: ModalType.CHAT_ERROR }));
        yield put(addStreamedChunk({
            stop: true,
            error: true,
            delta: '',
            chatId,
        }));
        return;
    }

    // Add response
    yield put(addStreamedChunk({
        chatId,
        stop: false,
        delta: data.choices[0].message.content,
    }));

    // End response
    yield put(addStreamedChunk({
        chatId,
        stop: true,
        delta: '',
    }));

    const chatTitle: string = yield select(
        (state: AppState) => state.chats[chatId].title
    );

    const defaultTitleRegex = /^New Conversation \d+$/;

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


export function* handleBrowserRegenerate({ payload } : 
    {
        payload: { chatId: string, msgId: string },
        type: string 
    }
) {
    const { chatId, msgId } = payload;

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

        // Add placeholder
        yield put(addStreamedChunk({
            chatId: payload.chatId,
            stop: false,
            delta: '',
        }));

        const { error, data }: { error: boolean, data: any } = yield call(getResponse, {
            messages: messagesPayload,
            model: currentModel,
            top_p: topP,
            baseURL,
            apiKey,
            temperature,
        });
    
        if (error) {
            yield put(openModal({ type: ModalType.CHAT_ERROR }));
            yield put(addStreamedChunk({
                stop: true,
                error: true,
                delta: '',
                chatId,
            }));
            return;
        }
    
        // Add response
        yield put(addStreamedChunk({
            chatId,
            stop: false,
            delta: data.choices[0].message.content,
        }));

        // End response
        yield put(addStreamedChunk({
            chatId,
            stop: true,
            delta: '',
        }));

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

        // Set chat to streaming mode
        yield put(addRegenerationChunk({
            stop: false,
            delta: '',
            chatId,
            msgId,
        }));

        const { error, data }: { error: boolean, data: any } = yield call(getResponse, {
            messages: messagesPayload,
            model: currentModel,
            top_p: topP,
            baseURL,
            apiKey,
            temperature,
        });

        if (error) {
            yield put(openModal({ type: ModalType.CHAT_ERROR }));
            yield put(addRegenerationChunk({
                stop: true,
                error: true,
                delta: '',
                chatId,
                msgId,
            }));
            return;
        }
    
        // Add response
        yield put(addRegenerationChunk({
            stop: false,
            delta: data.choices[0].message.content,
            chatId,
            msgId,
        }));

        // End response
        yield put(addRegenerationChunk({
            stop: true,
            delta: '',
            chatId,
            msgId,
        }));
    }
}