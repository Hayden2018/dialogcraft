import { AppState, ReasoningEffort } from './type.d';
import produce from 'immer';

const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api';

const LEGACY_BASE_URLS = ['https://api.openai.com', 'http://api.openai.com'];

function isLegacyProviderBaseURL(baseURL?: string) {
  if (!baseURL) return true;
  const normalized = baseURL.toLowerCase();
  if (LEGACY_BASE_URLS.some((url) => normalized.startsWith(url))) return true;
  // Azure OpenAI deployment-style endpoints
  if (normalized.includes('openai.azure.com')) return true;
  if (normalized.includes('cognitiveservices.azure.com')) return true;
  return false;
}

const migrations = {
  0: (state: AppState) =>
    produce(state, (draftState) => {
      // Legacy migration previously inferred openai/azure urlType.
      // No-op retained so existing version 0 stores still migrate cleanly.
      return draftState;
    }),
  1: (state: AppState) =>
    produce(state, (draftState) => {
      const global = draftState.setting.global as any;

      delete global.urlType;

      if (isLegacyProviderBaseURL(global.baseURL)) {
        global.baseURL = OPENROUTER_DEFAULT_BASE_URL;
      }

      if (global.reasoningEffort === undefined) {
        global.reasoningEffort = 'none' as ReasoningEffort;
      }
      if (global.excludeReasoning === undefined) {
        global.excludeReasoning = false;
      }

      for (const key of Object.keys(draftState.setting)) {
        const setting = draftState.setting[key] as any;
        delete setting.urlType;
        if (setting.reasoningEffort === undefined) {
          setting.reasoningEffort = global.reasoningEffort ?? 'none';
        }
        if (setting.excludeReasoning === undefined) {
          setting.excludeReasoning = global.excludeReasoning ?? false;
        }
      }

      for (const chatId of Object.keys(draftState.chats)) {
        const chat = draftState.chats[chatId];
        for (const message of chat.messages) {
          if ((message as any).reasoning === undefined) {
            message.reasoning = '';
          }
        }
        if (chat.rollbackMessage && (chat.rollbackMessage as any).reasoning === undefined) {
          chat.rollbackMessage.reasoning = '';
        }
      }

      return draftState;
    }),
};

export default migrations;
