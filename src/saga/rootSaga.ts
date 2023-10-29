import { takeEvery } from 'redux-saga/effects';
import { actionType } from "./actions";
import { handleGlobalSettingUpdate } from "./settingSaga";
import { handleUserMessage, handleRegenerate } from "./chatSaga";

function* rootSaga() {
    yield takeEvery(actionType.ON_MESSAGE, handleUserMessage);
    yield takeEvery(actionType.REGENERATE, handleRegenerate);
    yield takeEvery(actionType.GLOBAL_SETTING, handleGlobalSettingUpdate);
}

export default rootSaga;