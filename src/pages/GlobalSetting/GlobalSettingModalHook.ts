import { useDispatch } from "react-redux";
import { store } from 'redux/store';

import { PageType } from 'redux/type.d';
import { removeAPICredentials } from 'redux/settingSlice';
import { navigate, resetPages } from "redux/pageSlice";


async function exportChat() {
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
        const exportPath = file.filePath.toString();
        fs.writeFile(exportPath, dataString, () => {});
    }
}

export const useDataActions = () => {

    const dispatch = useDispatch();

    const disconnectApp = () => {
        dispatch(navigate({ to: PageType.LOGIN }));
        dispatch(removeAPICredentials());
        dispatch(resetPages());
    }

    const showResetPage = () => dispatch(
        navigate({ to: PageType.SETTING_RESET })
    );

    const showImportPage = () => dispatch(
        navigate({ to: PageType.SETTING_IMPORT })
    );

    return {
        disconnectApp,
        showResetPage,
        showImportPage,
        exportChat,
    }
}