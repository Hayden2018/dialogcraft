import { select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { AppState, ChatMessage, ReasoningEffort, SettingConfig } from 'redux/type.d';
import { onElectronEnv, chatTitlePrompt } from 'utils';
import { v4 as uuidv4 } from 'uuid';

const messageAgent = onElectronEnv() ? window.require('electron').ipcRenderer : null;

const OPENROUTER_HEADERS = {
  'HTTP-Referer': 'https://github.com/Hayden2018/dialogcraft',
  'X-Title': 'DialogCraft',
};

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
    const prevCharNotEscape = prevChar !== '\\' || prevChar === prevPrevChar;

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

function extractReasoningDetailsText(delta: any): string | null {
  if (!Array.isArray(delta.reasoning_details)) return null;

  let text = '';
  let hasContent = false;
  for (const detail of delta.reasoning_details) {
    if (!detail || typeof detail !== 'object') continue;
    if (typeof detail.text === 'string') {
      text += detail.text;
      hasContent = true;
    } else if (typeof detail.summary === 'string') {
      text += detail.summary;
      hasContent = true;
    }
  }
  return hasContent ? text : null;
}

// Extract the reasoning delta for one streamed chunk.
// OpenRouter can deliver the same reasoning in several fields on a single
// chunk (the `reasoning`/`reasoning_content` string AND the structured
// `reasoning_details` array), and some providers send the full accumulated
// reasoning on every chunk. To avoid duplicated text we always use a single
// source of truth and drop any part that was already accumulated.
export function extractReasoningDelta(delta: any, accumulated: string = ''): string {
  if (!delta) return '';

  let raw: string;
  const detailsText = extractReasoningDetailsText(delta);
  if (detailsText !== null) {
    raw = detailsText;
  } else if (typeof delta.reasoning === 'string') {
    raw = delta.reasoning;
  } else if (typeof delta.reasoning_content === 'string') {
    raw = delta.reasoning_content;
  } else {
    return '';
  }

  if (!raw) return '';

  // Some providers send the full reasoning text so far in every chunk
  // (cumulative deltas) instead of only the new portion.
  if (accumulated && raw.startsWith(accumulated)) {
    return raw.slice(accumulated.length);
  }

  return raw;
}

export function buildReasoningPayload(reasoningEffort?: ReasoningEffort, excludeReasoning?: boolean) {
  if (excludeReasoning) {
    if (reasoningEffort && reasoningEffort !== 'none') {
      return {
        effort: reasoningEffort,
        exclude: true,
      };
    }
    return { exclude: true };
  }

  if (!reasoningEffort || reasoningEffort === 'none') {
    return undefined;
  }

  return { effort: reasoningEffort };
}

function buildOpenRouterHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...OPENROUTER_HEADERS,
  };
}

function normalizeBaseURL(baseURL?: string) {
  return (baseURL || '').replace(/\/+$/, '');
}

export async function getChatTitle(
  messageHistory: Array<ChatMessage>,
  baseURL: string,
  apiKey: string,
  model: string
) {
  try {
    const response = await fetch(`${normalizeBaseURL(baseURL)}/v1/chat/completions`, {
      method: 'POST',
      headers: buildOpenRouterHeaders(apiKey),
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          ...messageHistory.map((msg) => ({
            role: msg.role,
            content: msg.editedContent || msg.content,
          })),
          {
            role: 'user',
            content: chatTitlePrompt,
          },
        ],
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
    reasoningEffort,
    excludeReasoning,
  }: SettingConfig = yield select((state: AppState) => state.setting[chatId]);

  const { baseURL, apiKey }: SettingConfig = yield select((state: AppState) => state.setting.global);

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

  const reasoning = buildReasoningPayload(reasoningEffort, excludeReasoning);
  const requestBody: Record<string, unknown> = {
    model: currentModel,
    messages: messagesPayload,
    top_p: topP,
    temperature,
    stream: true,
  };
  if (reasoning) {
    requestBody.reasoning = reasoning;
  }

  const requestId = uuidv4();
  const normalizedBaseURL = normalizeBaseURL(baseURL);

  // On Electron use Ipc to communicate with Node backend
  if (onElectronEnv()) {
    messageAgent.send('MESSAGE', {
      baseURL: normalizedBaseURL,
      apiKey,
      topP,
      temperature,
      model: currentModel,
      messages: messagesPayload,
      reasoning,
      requestId,
    });
    return eventChannel((emit) => {
      const msgListener = (_: unknown, data: any) => emit(data);
      const interruptListener = (event: CustomEvent<{ chatId: string }>) => {
        if (event.detail.chatId === chatId) {
          emit({ finish_reason: 'interrupt' });
        }
      };
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
      };

      const requestURL = `${normalizedBaseURL}/v1/chat/completions`;
      const headers = buildOpenRouterHeaders(apiKey!);

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
      };

      document.addEventListener('interrupt', interruptListener);

      fetch(requestURL, {
        method: 'POST',
        signal: controller.signal,
        headers,
        body: JSON.stringify(requestBody),
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
            const parseResult = parseNoisyJSON(residue + decodedChunk);
            residue = parseResult.residue;

            parseResult.jsons.forEach((jsonChunk) => {
              const normalizedChunk = normalizeChunk(jsonChunk);
              if (normalizedChunk) {
                safeEmit(normalizedChunk);
              }
            });
          }
        })
        .catch((error: any) => {
          if (error?.name !== 'AbortError' && !interruptEmitted && !timeoutEmitted) {
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
      };
    });
  }
}
