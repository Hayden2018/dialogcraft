import Dialog from '@mui/material/Dialog';
import { useDispatch, useSelector } from "react-redux";
import { useForm } from 'react-hook-form';
import { TextField, FormControlLabel, Slider, Button, Select, Switch, MenuItem, Alert, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';

import { toggleTheme, updateChatSetting } from 'redux/settingSlice';
import { AppState, SettingConfig, SettingStatus } from 'redux/type.d';
import { closeModal } from 'redux/modalSlice';
import { useDataActions } from './GlobalSettingModalHook';
import ResetAppWarning from 'components/ResetAppWarning/ResetAppWarning';
import ImportChats from 'components/ChatImport/ChatImport';
import { onElectronEnv } from 'utils';

const Form = styled('form')(
    ({ theme }) => ({
        margin: 'auto',
        padding: '0px 20px',
        width: '95%',
        maxWidth: 1000,
        verticalAlign: 'top'
    })
);

const FormHeader = styled('div')(
    ({ theme: { palette } }) => ({
        backgroundColor: palette.mode === 'dark' ? '#383838' : '#fdfdfd',
        zIndex: 100,
        textAlign: 'center',
        fontSize: 30,
        lineHeight: '58px',
        borderBottom: `1px solid ${palette.grey[500]}`,
        marginBottom: 22,
        position: 'sticky',
        top: 0,
    })
);

type RowProps = { narrow?: boolean, tall?: boolean };
const FormRow = styled('div')<RowProps>(
    ({ theme, narrow, tall }) => ({
        margin: `${ tall ? '25px' : '20px' } ${ narrow ? '25px' : '22px' }`,
    })
);

const InfoList = styled('ul')(
    ({ theme }) => ({
        margin: 0,
        paddingLeft: 20,
    })
);

const SliderTop = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 17,
    })
);

const SubmitRow = styled('div')(
    ({ theme }) => ({
        margin: '20px 0px 35px',
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
    })
);

const SubmitButton = styled(Button)(
    ({ theme }) => ({
        width: 120,
        height: 40,
        padding: 0,
    })
);

const ActionRow = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        margin: '20px 22px',
    })
);

const ActionButton = styled(Button)(
    ({ theme }) => ({
        flexGrow: 1,
    })
);

const ProgressContainer = styled('div')(
    ({ theme: { palette } }) => ({
        marginTop: 'calc(50vh - 120px)',
        textAlign: 'center',
        '& p': {
            fontSize: 22,
            margin: 36,
        },
        "& > :nth-child(2)": {
            width: '75%',
            maxWidth: 1600,
            margin: 'auto',
        },
    })
);

export default function GlobalSettingModal() {

    const dispatch = useDispatch();

    const globalSettings: SettingConfig = useSelector((state: AppState) => state.setting.global);
    const { status, darkMode, urlType } = globalSettings;

    console.log(urlType)

    const { register, handleSubmit, watch, setValue } = useForm<SettingConfig>({
        defaultValues: globalSettings,
    });

    const autoTitle = watch('autoTitle');
    const enterSend = watch('enterSend');
    const maxContext = watch('maxContext');
    const temperature = watch('temperature');
    const topP = watch('topP');

    const onSubmit = (data: SettingConfig) => {
        delete data.darkMode;
        data.systemPrompt = data.systemPrompt.trim();
        dispatch(updateChatSetting({
            settingId: 'global',
            setting: data,
        }));
        dispatch(closeModal());
    }

    const onDiscard = () => {
        // Revert to original status
        dispatch(updateChatSetting({
            settingId: 'global',
            setting: { status: SettingStatus.OK },
        }));
        dispatch(closeModal());
    }

    const { disconnectApp, showResetPage, showImportPage, exportChat } = useDataActions();

    return (
        <Dialog open fullScreen>
            { 
                (status === SettingStatus.OK || status === SettingStatus.ERROR) && 
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormHeader>Settings</FormHeader>
                    <FormRow tall={status !== SettingStatus.ERROR}>
                        <Alert severity='info'>
                            <InfoList>
                                <li>Reset App - remove all user data including conversations, settings and API credentials.</li> 
                                <li>Disconnect - remove API credentials but keep all other data and return to login page.</li>
                                { onElectronEnv() && <li>Export Chats - export all conversation history as JSON file.</li> }
                                { onElectronEnv() && <li>Import Chats - import conversation history from a previously exported JSON file.</li> }
                            </InfoList>
                        </Alert>
                    </FormRow>
                    <FormRow>
                        <TextField
                            disabled
                            fullWidth
                            label={urlType === 'openai' ? 'API Base URL' : 'Azure OpenAI Endpoint'}
                            {...register('baseURL')}
                        />
                    </FormRow>
                    <FormRow>
                        <TextField
                            disabled
                            fullWidth
                            type='password'
                            label={urlType === 'openai' ? 'API Key (Bearer token)' : 'API Key'}
                            {...register('apiKey')}
                        />
                    </FormRow>
                    <ActionRow>
                        <ActionButton color='error' variant='contained' onClick={showResetPage}> 
                            Reset App
                        </ActionButton>
                        <ActionButton color='warning' variant='contained' onClick={disconnectApp}>
                            Disconnect
                        </ActionButton>
                        {
                            onElectronEnv() &&
                            <ActionButton color='info' variant='contained' onClick={showImportPage}>
                                Import Chats
                            </ActionButton>
                        }
                        {
                            onElectronEnv() &&
                            <ActionButton color='success' variant='contained' onClick={exportChat}>
                                Export Chats
                            </ActionButton>
                        }   
                    </ActionRow>
                    <FormRow>
                        <Alert severity='info'>
                            <InfoList>
                                <li>GPT Model - default model for generating responses when starting a new conversation.</li> 
                                <li>Temperature - higher values will make the output more random, while lower values more deterministic.</li> 
                                <li>Top P - the model only considers tokens within top P probability mass.</li>
                            </InfoList>
                        </Alert>
                    </FormRow>
                    {
                        urlType === 'openai' &&
                        <FormRow>
                            <p style={{ margin: '0px 0px 5px 5px' }}>Default GPT Model</p>
                            <Select 
                                fullWidth
                                defaultValue={globalSettings.currentModel}
                                onChange={(event) => setValue('currentModel', event.target.value)}
                            >
                                {
                                    globalSettings.availableModels.map(
                                        (modelId, index) => <MenuItem value={modelId} key={index}>{modelId}</MenuItem>
                                    )
                                }
                            </Select>
                        </FormRow>
                    }
                    <FormRow narrow tall>
                        <SliderTop>
                            <span>Temperature</span>
                            <span>{temperature}</span>
                        </SliderTop>
                        <Slider
                            min={0}
                            max={100}
                            value={temperature * 100}
                            onChange={(event, newValue) => setValue('temperature', newValue as number / 100)}
                            aria-labelledby='temperature-slider'
                        />
                    </FormRow>
                    <FormRow narrow tall>
                        <SliderTop>
                            <span>Top P</span>
                            <span>{topP}</span>
                        </SliderTop>
                        <Slider
                            min={0}
                            max={100}
                            value={topP * 100}
                            onChange={(event, newValue) => setValue('topP', newValue as number / 100)}
                            aria-labelledby='topP-slider'
                        />
                    </FormRow>
                    <FormRow tall>
                        <Alert severity='info'>
                            <InfoList>
                                <li>System Prompt - guidance for the model on the conversation context before any user messages</li>
                                <li>
                                    Maximum context messages - maximum number of previous messages visible by the model.
                                    Lowering this number help reduce API cost but the model may forget earlier conversations.
                                </li> 
                            </InfoList>
                        </Alert>
                    </FormRow>
                    <FormRow>
                        <TextField
                            label='System Prompt'
                            fullWidth
                            multiline
                            rows={4}
                            {...register('systemPrompt')}
                        />
                    </FormRow>
                    <FormRow narrow tall>
                        <SliderTop>
                            <span>Maximum context messages</span>
                            <span>{maxContext}</span>
                        </SliderTop>
                        <Slider
                            min={1}
                            max={100}
                            value={maxContext}
                            onChange={(event, newValue) => setValue('maxContext', newValue as number)}
                            aria-labelledby='topP-slider'
                        />
                    </FormRow>
                    <FormRow>
                        <Alert severity='info'>
                            <li>Press <b>{ enterSend ?  'Enter' : 'Shift + Enter' }</b> to send your message.</li>
                            <li>Press <b>{ enterSend ?  'Shift + Enter' : 'Enter' }</b> to add a new line in your message.</li>
                            {
                                autoTitle ?
                                <li>AI will generate a title for your new chat after responding the first message.</li> :
                                <li>Auto chat title generation disabled.</li>
                            }
                        </Alert>
                    </FormRow>
                    <FormRow narrow>
                        <FormControlLabel
                            control={<Switch {...register('enterSend')} checked={enterSend}/>}
                            label='Press Enter to Send Messages'
                        />
                    </FormRow>
                    <FormRow narrow>
                        <FormControlLabel
                            control={<Switch {...register('autoTitle')} checked={autoTitle}/>}
                            label='Auto-generate Chat Title'
                        />
                    </FormRow>
                    <FormRow narrow>
                        <FormControlLabel
                            control={<Switch onClick={() => dispatch(toggleTheme())} checked={darkMode}/>}
                            label='Enable Dark Mode'
                        />
                    </FormRow>
                    <SubmitRow>
                        <SubmitButton color='warning' variant='contained' onClick={onDiscard}>
                            Discard
                        </SubmitButton>
                        <SubmitButton type='submit' variant='contained'>
                            Save
                        </SubmitButton>
                    </SubmitRow>
                </Form> 
            }
            {
                status === SettingStatus.VERIFYING && 
                <ProgressContainer>
                    <p>Verifying your API credentials...</p>
                    <LinearProgress />
                </ProgressContainer>
            }
            { 
                (status === SettingStatus.IMPORT || status === SettingStatus.IMPORT_ERROR || status === SettingStatus.IMPORT_SUCCESS) && 
                <ImportChats /> 
            }
            { status === SettingStatus.RESET && <ResetAppWarning /> }
        </Dialog>
    )
}