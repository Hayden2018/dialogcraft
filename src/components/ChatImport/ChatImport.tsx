import { useDispatch } from 'react-redux';
import { Button, Alert } from '@mui/material';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/system';

import { ReactComponent as TickIcon } from './tick.svg';
import { useChatImport } from './ChatImportHook';
import { useBackButton } from 'utils';
import { back } from 'redux/pageSlice';


const Container = styled('div')(
    ({ theme }) => ({
        margin: '0px auto',
        height: '100%',
        width: '100%',
        maxWidth: '600px',
        padding: '0px 25px',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
    })
);

const SuccessIcon = styled(TickIcon)(
    ({ theme }) => ({
        display: 'block',
        height: 150,
        width: 150,
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
        gap: 15,
    })
);

const ImportButton = styled(Button)(
    ({ theme }) => ({
        width: 200,
        height: 40,
        padding: 0,
    })
);

const CancelButton = styled(Button)(
    ({ theme }) => ({
        width: 120,
        height: 40,
        padding: 0,
    })
);

function ImportChats() {

    const dispatch = useDispatch();

    const { importStatus, importMode, onModeChange, importJSON } = useChatImport();

    const backToSetting = () => dispatch(back());
    useBackButton(backToSetting);

    if (importStatus === 'success') return (
        <Container>
            <h1>Import successful</h1>
            <SuccessIcon />
            <SuccessMessage>Chats import successful. Note that chats are arranged in time order with older imported chats appearing further down the list.</SuccessMessage>
            <ButtonRow>
                <CancelButton variant='contained' onClick={backToSetting}>
                    Complete
                </CancelButton>
            </ButtonRow>
        </Container>
    )

    return (
        <Container>
            <h1>Import Options</h1>
            {
                importMode === 'replace' &&
                <Alert severity='warning' style={{ margin: '-10px 6px 6px -6px' }}>
                    All your existing conversations will be deleted and replaced.
                </Alert>
            }
            {
                importStatus === 'error' &&
                <Alert severity='error' style={{ margin: '-10px 6px 6px -6px' }}>
                    Invalid file format. Make sure the file is previously exported from this app.
                </Alert>
            }
            <RadioGroup value={importMode} onChange={onModeChange}>
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