import { actionType } from "./actions";
import { handleUserMessage } from "./chatSaga";

import { takeEvery } from 'redux-saga/effects';

function* rootSaga() {
    yield takeEvery(actionType.ON_MESSAGE, handleUserMessage);
}

export default rootSaga;