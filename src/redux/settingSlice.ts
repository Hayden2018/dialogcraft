import { createSlice } from '@reduxjs/toolkit'
import { SettingConfig, SettingStatus } from 'redux/type.d';

const initialGlobalSetting: SettingConfig = {
    availableModels: [],
    currentModel: '',
    temperature: 0.7,
    topP: 1,
    systemPrompt: '',
    maxContext: 50,
    status: SettingStatus.NO_KEY,
    darkMode: true,
    enterSend: true,
    baseURL: 'https://api.openai.com',
    apiKey: '',
}

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
            return settings;
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
            };
            return settings;
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
                };
            }
            return settings;
        },
        deleteSetting(settings, { payload }) {
            const { settingId } = payload;
            delete settings[settingId];
            return settings;
        },
        updateModelList(settings, { payload }) { 
            for (const key in settings) {
                const currentModel = settings[key].currentModel;
                settings[key].availableModels = payload;
                if (!payload.includes(currentModel)) {
                    settings[key].currentModel = payload[0];
                }
            }
            return settings;
        },
        toggleTheme(settings) {
            settings.global.darkMode = !settings.global.darkMode;
            return settings;
        },
        removeAPICredentials(settings) {
            settings.global.baseURL = 'https://api.openai.com';
            settings.global.apiKey = '';
            settings.global.status = SettingStatus.NO_KEY;
            return settings;
        },
        resetSettings() {
            return {
                global: initialGlobalSetting,
            }
        }
    }
})

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