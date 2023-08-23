import { useDispatch } from "react-redux";
import { Button, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { ChangeEvent, useState } from "react";
import { resetSettings, updateChatSetting } from 'redux/settingSlice';

const Container = styled('div')(
    ({ theme }) => ({
        margin: '20px auto',
        width: 560,
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
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
        width: 220,
        height: 40,
        padding: 0,
    })
);

const CancelButton = styled(Button)(
    ({ theme }) => ({
        width: 140,
        height: 40,
        padding: 0,
    })
);

function ImportChats() {

    const dispatch = useDispatch();

    const [importMode, setImportMode] = useState<string>('merge');
    const [error, setError] = useState<boolean>(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setImportMode(event.target.value);
    }

    const backToSetting = () => dispatch(
        updateChatSetting({
            settingId: 'global',
            setting: { status: 'ok' },
        })
    )

    const importJSON = async () => {
        const { dialog } = window.require('@electron/remote');
        const file = await dialog.showOpenDialog({
            title: 'Import',
            buttonLabel: 'Import',
            filters: [{ name: 'json', extensions: ['json'] }],
        });

        if (file && !file.canceled) {
            try {
                const jsonData = window.require(file.filePaths[0]);
                console.log(jsonData);
            } catch {
                setError(true);
            }
        }
    }

    return (
        <Container>
            <h1>Select an import mode</h1>
            {
                importMode === 'replace' &&
                <Alert severity='warning' style={{ margin: '-10px 6px 6px -6px' }}>
                    All your existing conversations will be deleted and replaced.
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
                <CancelButton color='success' variant='contained' onClick={backToSetting}>
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