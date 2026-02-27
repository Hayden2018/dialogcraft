import { select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { AppState, ChatMessage, SettingConfig } from 'redux/type.d';
import { onElectronEnv, chatTitlePrompt } from 'utils';
import { v4 as uuidv4 } from 'uuid';

const messageAgent = onElectronEnv() ?
    window.require('electron').ipcRenderer :
    null;

function parseNoisyJSON(noisyString: string) {
    const parsedObjects: Array<any> = [];
    let bracketCount = 0;
    let jsonString = '';
    let insideString = false;
    let lastClosingIndex = 0;

    for (let index = 0; index < noisyString.length; index += 1) {
        const char = noisyString[index];
        const prevChar = index > 0 ? noisyString[index - 1] : '';
        const prevPrevChar = index > 1 ? noisyString[index - 2] : '';
        const prevCharNotEscape = prevChar !== '\\' || (prevChar === prevPrevChar);

        if (char === '"' && prevCharNotEscape) {
            insideString = !insideString;
        }

        if (!insideString && char === '{') {
            bracketCount += 1;
        }

        if (bracketCount > 0) {
            jsonString += char;
        }

        if (!insideString && char === '}') {
            bracketCount -= 1;
        }

        if (jsonString.length > 0 && bracketCount === 0 && !insideString) {
            try {
                parsedObjects.push(JSON.parse(jsonString));
                lastClosingIndex = index;
            } catch {
                // ignore malformed partial json
            }
            jsonString = '';
        }
    }

    return {
        jsons: parsedObjects,
        residue: noisyString.slice(lastClosingIndex + 1),
    };
}

function normalizeChunk(data: any) {
    if (data?.choices && data.choices.length) {
        return data.choices[0];
    }

    if (data?.delta || data?.finish_reason || data?.finish_details) {
        return data;
    }

    return null;
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
    // On Browser stream directly with fetch readable stream
    else {
        return eventChannel((emit) => {
            const controller = new AbortController();
            let residue = '';
            let isClosed = false;
            let interruptEmitted = false;
            let timeoutEmitted = false;
            let lastChunkTime = new Date().getTime();

            const safeEmit = (data: any) => {
                if (!isClosed) emit(data);
            }

            const requestURL = urlType === 'openai' ? `${baseURL}/v1/chat/completions` : baseURL;
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

            const timeoutCheck = setInterval(() => {
                if (new Date().getTime() - lastChunkTime > 30000 && !timeoutEmitted && !interruptEmitted) {
                    timeoutEmitted = true;
                    safeEmit({ finish_reason: 'timeout' });
                    controller.abort();
                }
            }, 1000);

            const interruptListener = (event: CustomEvent<{ chatId: string }>) => {
                if (event.detail.chatId === chatId) {
                    interruptEmitted = true;
                    safeEmit({ finish_reason: 'interrupt' });
                    controller.abort();
                }
            }

            document.addEventListener('interrupt', interruptListener);

            fetch(requestURL, {
                method: 'POST',
                signal: controller.signal,
                headers,
                body: JSON.stringify({
                    model: currentModel,
                    messages: messagesPayload,
                    top_p: topP,
                    temperature,
                    max_tokens: 800,
                    stream: true,
                }),
            })
                .then(async (response) => {
                    if (!response.ok || !response.body) {
                        safeEmit({ finish_reason: 'error' });
                        return;
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();

                    while (!isClosed) {
                        const { value, done } = await reader.read();
                        if (done) {
                            if (!timeoutEmitted && !interruptEmitted) {
                                safeEmit({ finish_reason: 'stop' });
                            }
                            break;
                        }

                        if (!value) continue;
                        lastChunkTime = new Date().getTime();

                        const decodedChunk = decoder.decode(value, { stream: true });
                        const responseText = residue + decodedChunk;

                        if (responseText.includes('[DONE]')) {
                            residue = responseText.replace(/\[DONE\]/g, '');
                        } else {
                            residue = responseText;
                        }

                        const parseResult = parseNoisyJSON(residue);
                        residue = parseResult.residue;

                        parseResult.jsons.forEach((jsonChunk) => {
                            const normalizedChunk = normalizeChunk(jsonChunk);
                            if (normalizedChunk) {
                                safeEmit(normalizedChunk);
                            }
                        });

                        if (decodedChunk.includes('[DONE]') && !timeoutEmitted && !interruptEmitted) {
                            safeEmit({ finish_reason: 'stop' });
                            break;
                        }
                    }
                })
                .catch((error: any) => {
                    if (
                        error?.name !== 'AbortError' &&
                        !interruptEmitted &&
                        !timeoutEmitted
                    ) {
                        safeEmit({ finish_reason: 'error' });
                    }
                })
                .finally(() => {
                    clearInterval(timeoutCheck);
                    document.removeEventListener('interrupt', interruptListener);
                });

            return () => {
                isClosed = true;
                controller.abort();
                clearInterval(timeoutCheck);
                document.removeEventListener('interrupt', interruptListener);
            }
        });
    }
}