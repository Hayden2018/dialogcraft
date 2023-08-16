import Dialog from '@mui/material/Dialog';
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { useForm } from 'react-hook-form';
import { TextField, FormControlLabel, Slider, Button, Select, Switch, MenuItem, Alert, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';
import { AppState, SettingConfig } from 'redux/type.d';
import { updateGlobalSetting } from 'saga/actions';

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
    ({ theme }) => ({
        backgroundColor: '#383838',
        zIndex: 100,
        textAlign: 'center',
        fontSize: 30,
        lineHeight: '58px',
        borderBottom: `1px solid ${theme.palette.grey[500]}`,
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

const ButtonRow = styled('div')(
    ({ theme }) => ({
        margin: '20px 0px 30px',
        display: 'flex',
        justifyContent: 'center',
        gap: 20,
    })
);

const FormButton = styled(Button)(
    ({ theme }) => ({
        width: 120,
        height: 40,
        padding: 0,
    })
);

const ProgressContainer = styled('div')(
    ({ theme }) => ({
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

function GlobalSettingModal() {

    const dispatch = useDispatch();

    const globalSettings = useSelector((state: AppState) => state.setting.global);

    const { register, handleSubmit, watch, setValue } = useForm<SettingConfig>({
        defaultValues: globalSettings,
    });

    const enterSend = watch('enterSend');
    const maxContext = watch('maxContext');
    const temperature = watch('temperature');
    const topP = watch('topP');

    const onSubmit = (data: SettingConfig) => {
        dispatch(updateGlobalSetting(data));
    }

    if (globalSettings.status === 'verifying') return (
        <Dialog open fullScreen>
            <ProgressContainer>
                <p>Verifying your API credentials...</p>
                <LinearProgress />
            </ProgressContainer>
        </Dialog>
    )

    return (
        <Dialog open fullScreen>
            
            <Form onSubmit={handleSubmit(onSubmit)}>

                <FormHeader>Settings</FormHeader>

                <FormRow tall>
                    <Alert severity='info'>
                        Settings here includes API credentials and default values for new conversations.
                    </Alert>
                </FormRow>

                <FormRow>
                    <TextField
                        fullWidth
                        label='API URL'
                        {...register('baseURL')}
                    />
                </FormRow>
                <FormRow>
                    <TextField
                        fullWidth
                        label='API Key'
                        type='password'
                        {...register('apiKey')}
                    />
                </FormRow>
                <FormRow tall>
                    <p style={{ margin: '0px 0px 5px 5px' }}>GPT Model</p>
                    <Select fullWidth defaultValue={globalSettings.currentModel}>
                        {
                            globalSettings.availableModels.map(
                                (modelId) => <MenuItem value={modelId}>{modelId}</MenuItem>
                            )
                        }
                    </Select>
                </FormRow>

                <FormRow>
                    <Alert severity='info'>
                        <InfoList>
                            <li>Temperature - higher values will make the output more random, while lower values more deterministic.</li> 
                            <li>Top P - the model only considers tokens within top P probability mass.</li>
                            <li>It is suggested to change either one of them while leave the other one at default.</li>
                        </InfoList>
                    </Alert>
                </FormRow>

                <FormRow narrow tall>
                    <SliderTop>
                        <span>Temperature</span>
                        <span>{temperature}</span>
                    </SliderTop>
                    <Slider
                        min={0}
                        max={100}
                        value={temperature * 50}
                        onChange={(event, newValue) => setValue('temperature', newValue as number / 50)}
                        aria-labelledby='temperature-slider'
                    />
                </FormRow>

                <FormRow narrow tall>
                    <SliderTop>
                        <span>Top P</span>
                        <span>{topP}</span>
                    </SliderTop>
                    <Slider
                        min={1}
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
                    </Alert>
                </FormRow>

                <FormRow narrow>
                    <FormControlLabel
                        control={<Switch {...register('enterSend')} checked={enterSend}/>}
                        label='Press Enter to send message'
                    />
                </FormRow>

                <ButtonRow>
                    <FormButton color='warning' variant='contained' onClick={() => dispatch(closeModal())}>
                        Discard
                    </FormButton>
                    <FormButton type='submit' variant='contained'>
                        Save
                    </FormButton>
                </ButtonRow>
                
            </Form>
        </Dialog>
    )
}

export default GlobalSettingModal;