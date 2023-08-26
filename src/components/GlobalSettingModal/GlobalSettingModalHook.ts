import { useDispatch } from "react-redux";
import { store } from 'redux/store';

import { removeAPICredentials, updateChatSetting } from 'redux/settingSlice';
import { SettingStatus } from 'redux/type.d';
import { closeModal } from 'redux/modalSlice';

export const useDataActions = () => {

    const dispatch = useDispatch();

    const exportChat = async () => {
        const { dialog, app, getCurrentWindow } = window.require('@electron/remote');
        const fs = window.require('fs');

        const file = await dialog.showSaveDialog(
            getCurrentWindow(),
            {
                title: 'Export',
                defaultPath: 'chats.json',
                buttonLabel: 'Save',
                filters: [{ name: 'json', extensions: ['json'] }],
            }
        );

        const { chatList, chats } = store.getState();

        if (file && !file.canceled) {
            const exportPayload = { version: app.getVersion(), chatList, chats };
            const dataString = JSON.stringify(exportPayload, null, 2);
            fs.writeFile(file.filePath.toString(), dataString, () => dispatch(closeModal()));
        }
    }

    const disconnectApp = () => dispatch(
        removeAPICredentials()
    )

    const showResetPage = () => dispatch(
        updateChatSetting({
            settingId: 'global',
            setting: { status: SettingStatus.RESET },
        })
    )

    const showImportPage = () => dispatch(
        updateChatSetting({
            settingId: 'global',
            setting: { status: SettingStatus.IMPORT },
        })
    )

    return {
        disconnectApp,
        showResetPage,
        showImportPage,
        exportChat
    }
}