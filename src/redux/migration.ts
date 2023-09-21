import { AppState } from './type.d';
import produce from 'immer';

const migrations = {
    0: (state: AppState) => produce(state, draftState => {
        const { urlType, baseURL } = draftState.setting.global;
        if (urlType) return draftState;
        if (baseURL?.includes('api.openai.com') || !baseURL) {
            draftState.setting.global.urlType = 'openai';
            return draftState;
        } else {
            draftState.setting.global.urlType = 'azure';
            return draftState;
        }
    }),
};

export default migrations;

