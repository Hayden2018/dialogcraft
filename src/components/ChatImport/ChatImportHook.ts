import { ChangeEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "redux/type";
import { importChat } from "saga/actions";

export const useChatImport = () => {

    const dispatch = useDispatch();

    const [importMode, setImportMode] = useState<string>('merge');
    const status = useSelector((state: AppState) => state.setting.global.status);

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
            dispatch(
                importChat({
                    filePath: file.filePaths[0],
                    mode: importMode,
                })
            );
        }
    }

    const onModeChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImportMode(event.target.value);
    }

    return {
        importStatus: status,
        importMode,
        onModeChange,
        importJSON,
    }
}

