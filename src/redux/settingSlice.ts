import { createSlice } from '@reduxjs/toolkit';
import { SettingConfig, SettingStatus } from 'redux/type.d';

export const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api';

const initialGlobalSetting: SettingConfig = {
  availableModels: [],
  currentModel: '',
  temperature: 1.0,
  topP: 0.95,
  systemPrompt: '',
  maxContext: 50,
  reasoningEffort: 'none',
  excludeReasoning: false,
  status: SettingStatus.NO_KEY,
  autoTitle: true,
  darkMode: true,
  enterSend: true,
  baseURL: OPENROUTER_DEFAULT_BASE_URL,
  apiKey: '',
};

const initialState: Record<string, SettingConfig> = {
  global: initialGlobalSetting,
};

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateChatSetting(settings, { payload }) {
      const { settingId, setting } = payload;
      settings[settingId] = {
        ...settings[settingId],
        ...setting,
      };
    },
    addSetting(settings, { payload }) {
      const { settingId } = payload;
      const settingDraft = settings.global;
      settings[settingId] = {
        currentModel: settingDraft.currentModel,
        availableModels: settingDraft.availableModels,
        systemPrompt: settingDraft.systemPrompt,
        maxContext: settingDraft.maxContext,
        temperature: settingDraft.temperature,
        topP: settingDraft.topP,
        reasoningEffort: settingDraft.reasoningEffort,
        excludeReasoning: settingDraft.excludeReasoning,
      };
    },
    bulkAddSetting(settings, { payload }) {
      const { settingIds } = payload;
      const settingDraft = settings.global;
      for (const settingId of settingIds) {
        if (settings[settingId]) continue;
        settings[settingId] = {
          currentModel: settingDraft.currentModel,
          availableModels: settingDraft.availableModels,
          systemPrompt: settingDraft.systemPrompt,
          maxContext: settingDraft.maxContext,
          temperature: settingDraft.temperature,
          topP: settingDraft.topP,
          reasoningEffort: settingDraft.reasoningEffort,
          excludeReasoning: settingDraft.excludeReasoning,
        };
      }
    },
    deleteSetting(settings, { payload }) {
      const { settingId } = payload;
      delete settings[settingId];
    },
    updateModelList(settings, { payload }) {
      for (const key in settings) {
        const currentModel = settings[key].currentModel;
        settings[key].availableModels = payload;
        if (!payload.includes(currentModel)) {
          settings[key].currentModel = payload[0];
        }
      }
    },
    toggleTheme(settings) {
      settings.global.darkMode = !settings.global.darkMode;
    },
    removeAPICredentials(settings) {
      settings.global.baseURL = OPENROUTER_DEFAULT_BASE_URL;
      settings.global.apiKey = '';
      settings.global.status = SettingStatus.NO_KEY;
    },
    resetSettings() {
      return {
        global: initialGlobalSetting,
      };
    },
  },
});

export default settingSlice.reducer;
export const {
  updateChatSetting,
  bulkAddSetting,
  addSetting,
  deleteSetting,
  updateModelList,
  toggleTheme,
  removeAPICredentials,
  resetSettings,
} = settingSlice.actions;
