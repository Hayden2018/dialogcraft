import { createSlice } from '@reduxjs/toolkit'
import { SettingConfig } from 'redux/type.d';

const initialState: Record<string, SettingConfig> = {
    global: {
        availableModels: [],
        currentModel: '',
        temperature: 1,
        topP: 1,
        systemPrompt: '',
        maxContext: 50,
        status: 'noKey',
        isGobal: true,
        enterSend: false,
        baseURL: 'https://api.openai.com',
        apiKey: '',
    }
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
                isGobal: false,
            };
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
    }
})

export default settingSlice.reducer;
export const { 
    updateChatSetting,
    addSetting,
    deleteSetting,
    updateModelList,
} = settingSlice.actions;