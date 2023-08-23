import { put, select, call } from "redux-saga/effects";
import { updateChatSetting } from "redux/settingSlice";
import { AppState, Chat, ChatList } from "redux/type";


function validateImportData(
    importedChatList: ChatList,
    importedChats: Record<string, Chat>,
    version: string
) {

}

export function* handleChatMerge(
    { payload: filePath } : 
    { payload: string, type: string }
) {
    try {
        const { 
            version,
            chatList: importedChatList,
            chats: importedChats
        } = window.require(filePath);

        validateImportData(importedChatList, importedChats, version);

        const { chatList: currentChatList, chats: currentChats } = yield select((state: AppState) => state);

        const newChatIds: Array<string> = [];
    
        const mergedChats: Record<string, Chat> = currentChats;
        for (const chatId in importedChats) {
            if (chatId in mergedChats) {
                const currentMessages = mergedChats[chatId].messages;
                const importedMessages = importedChats[chatId].messages;
                const currentChatTime = currentMessages.at(-1)?.time?.getTime() || 0;
                const importedChatTime = importedMessages.at(-1)?.time?.getTime() || 0;
                if (importedChatTime > currentChatTime) {
                    mergedChats[chatId] = importedChats[chatId];
                }
            } else {
                mergedChats[chatId] = importedChats[chatId];
                newChatIds.push(chatId);
            }
        }

        const mergedChatOrder = Object.keys(mergedChats);
        mergedChatOrder.sort(
            (chatIdA: string, chatIdB: string) => {
                const chatA = mergedChats[chatIdA];
                const chatB = mergedChats[chatIdA];
                const timeA = chatA.messages.at(-1)?.time?.getTime() || 0;
                const timeB = chatB.messages.at(-1)?.time?.getTime() || 0;
                return timeB - timeA;
            }
        );

        const mergedChatList = {
            chatOrder: mergedChatOrder,
            currentChatId: mergedChatOrder[0],
            incrementer: importedChatList.incrementer + currentChatList.incrementer,
        };



    } catch {
        yield put(
            updateChatSetting({
                settingId: 'globbal',
                setting: { status: 'import-error' },
            })
        );
    }
}