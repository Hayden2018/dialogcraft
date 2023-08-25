import { useDispatch } from "react-redux";
import { Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ChangeEvent, useState } from "react";
import { updateChatSetting } from 'redux/settingSlice';
import { importChat } from "saga/actions";
import { ReactComponent as TickIcon } from './tick.svg';
import { closeModal } from "redux/modalSlice";

const Container = styled('div')(
    ({ theme }) => ({
        margin: '20px auto',
        width: 595,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
    })
);

const SuccessIcon = styled(TickIcon)(
    ({ theme }) => ({
        display: 'block',
        height: 160,
        width: 160,
        margin: '10px auto',
    })
);

const SuccessMessage= styled('p')(
    ({ theme }) => ({
        margin: '12px 0px',
        fontSize: 18,
    })
);

const ButtonRow = styled('div')(
    ({ theme }) => ({
        margin: '20px 0px 30px',
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
    })
);

const ImportButton = styled(Button)(
    ({ theme }) => ({
        width: 210,
        height: 40,
        padding: 0,
    })
);

const CancelButton = styled(Button)(
    ({ theme }) => ({
        width: 130,
        height: 40,
        padding: 0,
    })
);

function ImportChats({ status } : { status: string }) {

    const dispatch = useDispatch();

    const [importMode, setImportMode] = useState<string>('merge');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImportMode(event.target.value);
    }

    const backToChats = () => {
        dispatch(closeModal());
        dispatch(
            updateChatSetting({
                settingId: 'global',
                setting: { status: 'ok' },
            })
        );
    }

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

    if (status === 'import-success') return (
        <Container>
            <h1>Import successful</h1>
            <SuccessIcon />
            <SuccessMessage>Chats import successful. Please note that chats are ordered by time with older imported chats appearing further down the list.</SuccessMessage>
            <ButtonRow>
                <CancelButton variant='contained' onClick={backToChats}>
                    Complete
                </CancelButton>
            </ButtonRow>
        </Container>
    )

    return (
        <Container>
            <h1>Select an import mode</h1>
            {
                importMode === 'replace' &&
                <Alert severity='warning' style={{ margin: '-10px 6px 6px -6px' }}>
                    All your existing conversations will be deleted and replaced.
                </Alert>
            }
            {
                status === 'import-error' &&
                <Alert severity='error' style={{ margin: '-10px 6px 6px -6px' }}>
                    Invalid file format. Make sure the file is previously exported from this app.
                </Alert>
            }
            <RadioGroup value={importMode} onChange={handleChange}>
                <FormControlLabel
                    value='merge'
                    control={<Radio />}
                    label='Merge imported conversations with existing conversations'
                />
                <FormControlLabel
                    value='replace'
                    control={<Radio />}
                    label='Replace all existing conversations with imported conversations'
                />
            </RadioGroup>

            <ButtonRow>
                <CancelButton color='success' variant='contained' onClick={backToChats}>
                    Cancel
                </CancelButton>
                <ImportButton color={importMode === 'merge' ? 'info' : 'warning'} variant='contained' onClick={importJSON}>
                    {importMode === 'merge' ? 'Import and Merge' : 'Import and Replace'}
                </ImportButton>
            </ButtonRow>
        </Container>
    )
}

export default ImportChats;