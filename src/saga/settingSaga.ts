import { call, put } from "redux-saga/effects";
import { closeModal } from "redux/modalSlice";
import { updateChatSetting, updateModelList } from "redux/settingSlice";
import { SettingConfig, SettingStatus } from "redux/type.d";

async function fetchModelList(url: string, apiKey: string) {

    try {
        const response = await fetch(`${url}/v1/models`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${apiKey}` },
        });

        if (!response.ok) throw Error('Unauthorized');
    
        const { data } = await response.json();
        const availableModels = data
            .map((model: any) => model.id)
            .filter((modelId: string) => modelId.includes('gpt'))
            .filter((modelId: string) => !modelId.includes('instruct'));
        
        return { error: false, data: availableModels };

    } catch (error) {
        return { error: true, data: null };
    }
}


export function* handleGlobalSettingUpdate({ payload }: 
    {
        payload: SettingConfig,
        type: string,
    }
) {

    yield put(updateChatSetting({
        settingId: 'global',
        setting: { status: SettingStatus.VERIFYING },
    }));

    const { baseURL, apiKey } = payload;
    const { error, data } = yield call(fetchModelList, baseURL!, apiKey!);

    if (error) {
        yield put(updateChatSetting({
            settingId: 'global',
            setting: { status: SettingStatus.ERROR },
        }));
        return;
    }
    
    yield put(updateChatSetting({
        settingId: 'global',
        setting: {
            ...payload,
            status: SettingStatus.OK,
        },
    }));

    yield put(updateModelList(data));
    yield put(closeModal());
}