import { takeEvery } from 'redux-saga/effects';
import { actionType } from "./actions";
import { handleGlobalSettingUpdate } from "./settingSaga";
import { handleChatMerge } from './importSaga';
import { handleUserMessage, handleRegenerate } from "./chatSaga";
import { handleBrowserRegenerate, handleBrowserUserMessage } from './chatBrowserSaga';
import { onElectronEnv } from 'utils';

function* rootSaga() {
    if (onElectronEnv()) {
        yield takeEvery(actionType.ON_MESSAGE, handleUserMessage);
        yield takeEvery(actionType.REGENERATE, handleRegenerate);
    } else {
        yield takeEvery(actionType.ON_MESSAGE, handleBrowserUserMessage);
        yield takeEvery(actionType.REGENERATE, handleBrowserRegenerate);
    }
    yield takeEvery(actionType.GLOBAL_SETTING, handleGlobalSettingUpdate);
    yield takeEvery(actionType.CHAT_IMPORT, handleChatMerge);
}

export default rootSaga;