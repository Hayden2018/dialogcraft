// **** This file is for Electron environment only **** 

import { put, select } from "redux-saga/effects";
import { setChatList } from "redux/chatListSlice";
import { setChats } from "redux/chatsSlice";
import { bulkAddSetting, updateChatSetting } from "redux/settingSlice";
import { AppState, Chat, ChatList, SettingStatus } from "redux/type.d";


function validateImportData(
    importedChatList: ChatList,
    importedChats: Record<string, Chat>,
    version: string
) {
    const { chatOrder, incrementer } = importedChatList;
    if (typeof incrementer !== 'number') throw Error('Invalid format');

    for (const chatId of chatOrder) {
        const chat = importedChats[chatId];

        if (!chat) throw Error('Invalid format');
        
        if (chat.id !== chatId || typeof chat.title !== 'string') {
            throw Error('Invalid format');
        }

        for (const msg of chat.messages) {
            if (
                typeof msg.id !== 'string' ||
                typeof msg.time !== 'number' ||
                typeof msg.role !== 'string' ||
                typeof msg.content !== 'string'
            ) {
                throw Error ('Invalid format')
            }
        }
    }
}

export function* handleChatMerge({ payload } : 
    { 
        payload: { mode: string, filePath: string },
        type: string,
    }
) {
    try {
        const { filePath, mode } = payload;

        const { 
            version,
            chatList: importedChatList,
            chats: importedChats
        } = window.require(filePath);

        validateImportData(importedChatList, importedChats, version);

        if (mode === 'replace') {
            yield put(setChats(importedChats));
            yield put(setChatList(importedChatList));
            yield put(bulkAddSetting({
                settingIds: Object.keys(importedChats),
            }));
            yield put(
                updateChatSetting({
                    settingId: 'global',
                    setting: { status: SettingStatus.IMPORT_SUCCESS },
                })
            );
            return;
        }

        const { chatList: currentChatList, chats: currentChats } = yield select((state: AppState) => state);

        const newChatIds: Array<string> = [];
    
        const mergedChats: Record<string, Chat> = { ...currentChats };
        for (const chatId in importedChats) {
            if (chatId in mergedChats) {
                const currentMessages = mergedChats[chatId].messages;
                const importedMessages = importedChats[chatId].messages;
                const currentChatTime = currentMessages.at(-1)?.time || 0;
                const importedChatTime = importedMessages.at(-1)?.time || 0;
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
                const chatB = mergedChats[chatIdB];
                const timeA = chatA.messages.at(-1)?.time || 0;
                const timeB = chatB.messages.at(-1)?.time || 0;
                return timeB - timeA;
            }
        );

        const mergedChatList = {
            chatOrder: mergedChatOrder,
            currentChatId: mergedChatOrder[0],
            incrementer: importedChatList.incrementer + currentChatList.incrementer,
        };

        yield put(setChats(mergedChats));
        yield put(setChatList(mergedChatList));
        yield put(bulkAddSetting({
            settingIds: Object.keys(mergedChats),
        }));
        yield put(
            updateChatSetting({
                settingId: 'global',
                setting: { status: SettingStatus.IMPORT_SUCCESS },
            })
        );

    } catch (error) {
        yield put(
            updateChatSetting({
                settingId: 'global',
                setting: { status: SettingStatus.IMPORT_ERROR },
            })
        );
    }
}