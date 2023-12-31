import { select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { AppState, ChatMessage, SettingConfig } from 'redux/type.d';
import { onElectronEnv, chatTitlePrompt } from 'utils';
import { v4 as uuidv4 } from 'uuid';

let messageAgent = onElectronEnv() ? 
    window.require('electron').ipcRenderer : 
    new WebSocket('wss://socket.hayden.life');

window.onfocus = () => {
    if (!onElectronEnv() && messageAgent.readyState === 3) {
        messageAgent = new WebSocket('wss://socket.hayden.life');
    }
}

export async function getChatTitle(
    messageHistory: Array<ChatMessage>,
    baseURL: string,
    apiKey: string,
    urlType: string,
) {
    try {
        const URL = urlType === 'openai' ? `${baseURL}/v1/chat/completions` : baseURL;
        const headers = urlType === 'openai' ? 
        { 
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        } 
            :
        { 
            'API-Key': apiKey,
            'Content-Type': 'application/json',
        };

        const response = await fetch(URL, {
            method: 'POST',
            headers: headers,
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


export function* requestResponse(messageHistory: Array<ChatMessage>, chatId: string) {

    const {
        topP,
        temperature,
        systemPrompt,
        currentModel,
        maxContext,
    }: SettingConfig = yield select(
        (state: AppState) => state.setting[chatId]
    );

    const { baseURL, apiKey, urlType }: SettingConfig = yield select(
        (state: AppState) => state.setting.global
    );

    let messagesPayload = messageHistory.map((msg) => ({
        role: msg.role,
        content: msg.editedContent || msg.content,
    }));

    if (messagesPayload.length > maxContext) {
        messagesPayload = messagesPayload.slice(-maxContext);
    }

    if (systemPrompt) {
        messagesPayload.unshift({
            role: 'system',
            content: systemPrompt,
        });
    }

    const requestId = uuidv4();

    // On Electron use Ipc to communicate with Node backend
    if (onElectronEnv()) {
        messageAgent.send('MESSAGE', {
            urlType,
            baseURL,
            apiKey,
            topP,
            temperature,
            model: currentModel,
            messages: messagesPayload,
            requestId,
        });
        return eventChannel((emit) => {
            const msgListener = (_: unknown, data: any) => emit(data);
            const interruptListener = (event: CustomEvent<{ chatId: string }>) => {
                if (event.detail.chatId === chatId) {
                    emit({ finish_reason: 'interrupt' });
                }
            }
            messageAgent.on(requestId, msgListener);
            document.addEventListener('interrupt', interruptListener);
            return () => {
                messageAgent.removeListener(requestId, msgListener);
                document.removeEventListener('interrupt', interruptListener);
            };
        });
    }
    // On Browser use Websocket proxy for text streaming
    else {
        messageAgent.send(
            JSON.stringify({
                urlType,
                baseURL,
                apiKey,
                top_p: topP,
                temperature,
                model: currentModel,
                messages: messagesPayload,
                action: 'dc-proxy',
                requestId,
            })
        );
        return eventChannel((emit) => {
            const listener = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.requestId === requestId) emit(data);
            }
            const interruptListener = (event: CustomEvent<{ chatId: string }>) => {
                if (event.detail.chatId === chatId) {
                    emit({ finish_reason: 'interrupt' });
                }
            }
            messageAgent.addEventListener('message', listener);
            document.addEventListener('interrupt', interruptListener);
            return () => {
                messageAgent.removeEventListener('message', listener);
                document.removeEventListener('interrupt', interruptListener);
            }
        });
    }
}