import { actionType } from "./actions";
import { handleUserMessage, handleRegenerate } from "./chatSaga";

import { takeEvery } from 'redux-saga/effects';

function* rootSaga() {
    yield takeEvery(actionType.ON_MESSAGE, handleUserMessage);
    yield takeEvery(actionType.REGENERATE, handleRegenerate);
}

export default rootSaga;