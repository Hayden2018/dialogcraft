// **** This file is for Electron environment only ****
import { ChangeEvent, useState } from "react";
import { store } from "redux/store";

import { setChatList } from "redux/chatListSlice";
import { setChats } from "redux/chatsSlice";
import { bulkAddSetting } from "redux/settingSlice";
import { Chat, ChatList } from "redux/type.d";


function validateImportData(
    importedChatList: ChatList,
    importedChats: Record<string, Chat>,
    version: string
) {
    const { chatOrder, incrementer } = importedChatList;
    if (typeof incrementer !== 'number') throw Error('Invalid format');

    for (const chatId of chatOrder) {

        const chat = importedChats[chatId];
        if (chat.id !== chatId || typeof chat.title !== 'string') 
            throw Error('Invalid format');

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

function handleChatImport(
    mode: string,
    filePath: string,
    setImportStatus: React.Dispatch<React.SetStateAction<string>>
) {
    try {
        const { dispatch, getState } = store;

        const { 
            version,
            chatList: importedChatList,
            chats: importedChats
        } = window.require(filePath);

        validateImportData(importedChatList, importedChats, version);

        if (mode === 'replace') {
            dispatch(setChats(importedChats));
            dispatch(setChatList(importedChatList));
            dispatch(bulkAddSetting({ settingIds: Object.keys(importedChats) }));
            setImportStatus('success');
            return;
        }

        const { chatList: currentChatList, chats: currentChats } = getState();

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

        dispatch(setChats(mergedChats));
        dispatch(setChatList(mergedChatList));
        dispatch(bulkAddSetting({ settingIds: Object.keys(mergedChats) }));
        setImportStatus('success');

    } catch (error) {
        setImportStatus('error');
    }
}

export const useChatImport = () => {

    const [importMode, setImportMode] = useState<string>('merge');
    const [importStatus, setImportStatus] = useState<string>('pending');

    const importJSON = async () => {
        const { dialog, getCurrentWindow } = window.require('@electron/remote');
        const file = await dialog.showOpenDialog(
            getCurrentWindow(),
            {
                title: 'Import',
                buttonLabel: 'Import',
                filters: [{ name: 'json', extensions: ['json'] }],
            }
        );

        if (file && !file.canceled) {
            handleChatImport(importMode, file.filePaths[0], setImportStatus);
        }
    }

    const onModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImportMode(event.target.value);
    }

    return {
        importStatus,
        importMode,
        onModeChange,
        importJSON,
    }
}
