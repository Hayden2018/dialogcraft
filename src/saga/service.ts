import { select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ChatMessage, SettingConfig } from 'redux/type.d';
import { onElectronEnv, chatTitlePrompt } from 'utils';

let messageAgent = onElectronEnv() ? 
    window.require('electron').ipcRenderer : 
    new WebSocket('wss://socket.hayden.life');

window.onfocus = () => {
    if (!onElectronEnv() && messageAgent.readyState === 3) {
        messageAgent = new WebSocket('wss://socket.hayden.life');
    }
}


export function getResponseStream(requestId: string) {
    return eventChannel((emit) => {
        // On Electron use Ipc to communicate with Node backend
        if (onElectronEnv()) {
            const listener = (_: unknown, data: any) => {
                emit(data);
            };
            messageAgent.on(requestId, listener);
            return () => messageAgent.removeListener(requestId, listener);
        } 
        // On Browser use Websocket proxy for text streaming
        else {
            const listener = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.requestId === requestId) {
                    emit(data);
                }
            };
            messageAgent.addEventListener('message', listener);
            return () => messageAgent.removeEventListener('message', listener);
        }
    });
}


export async function getChatTitle(messageHistory: Array<ChatMessage>, baseURL:string, apiKey: string) {
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


export function* requestResponse(messageHistory: Array<ChatMessage>, chatId: string) {

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

    // On Electron use Ipc to communicate with Node backend
    if (onElectronEnv()) {
        messageAgent.send('MESSAGE', {
            baseURL,
            apiKey,
            topP,
            temperature,
            model: currentModel,
            messages: messagesPayload,
            requestId,
        });
    }
    // On Browser use Websocket proxy for text streaming
    else {
        messageAgent.send(
            JSON.stringify({
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
    }

    return requestId;
}