import { call, put } from "redux-saga/effects";
import { closeModal } from "redux/modalSlice";
import { updateChatSetting, updateModelList } from "redux/settingSlice";
import { SettingConfig } from "redux/type";

async function fetchModelList(url: string, apiKey: string) {

    try {
        const response = await fetch(`${url}/v1/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!response.ok) {
            throw Error('Unauthorized');
        }
    
        let { data } = await response.json();
        data = data.map((model: any) => model.id);
        data = data.filter((modelId: string) => modelId.includes('gpt'));
        return { 
            error: false,
            data, 
        };

    } catch (error) {
        return {
            error: true,
            data: null,
        };
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
        setting: { status: 'verifying' },
    }));

    const { baseURL, apiKey } = payload;
    const { error, data } = yield call(fetchModelList, baseURL!, apiKey!);

    if (error) {
        yield put(updateChatSetting({
            settingId: 'global',
            setting: { status: 'error' },
        }));
        return;
    }
    
    yield put(updateChatSetting({
        settingId: 'global',
        setting: {
            ...payload,
            status: 'ok',
        },
    }));

    yield put(updateModelList(data));
    yield put(closeModal());
}