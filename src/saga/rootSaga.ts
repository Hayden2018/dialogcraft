import { actionType } from "./actions";
import { handleUserMessage, handleRegenerate } from "./chatSaga";

import { takeEvery } from 'redux-saga/effects';
import { handleGlobalSettingUpdate } from "./settingSaga";

function* rootSaga() {
    yield takeEvery(actionType.ON_MESSAGE, handleUserMessage);
    yield takeEvery(actionType.REGENERATE, handleRegenerate);
    yield takeEvery(actionType.GLOBAL_SETTING, handleGlobalSettingUpdate);
}

export default rootSaga;