import Dialog from '@mui/material/Dialog';
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { useForm } from 'react-hook-form';
import { TextField, FormControlLabel, Slider, Button, Select, Switch, MenuItem, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { AppState, ModalPayload, SettingConfig } from 'redux/type';
import { updateSetting } from 'redux/settingSlice';

const Form = styled('form')(
    ({ theme }) => ({
        margin: 'auto',
        padding: '0px 20px',
        width: '95%',
        verticalAlign: 'top'
    })
);

const FormHeader = styled('div')(
    ({ theme }) => ({
        backgroundColor: '#383838',
        zIndex: 100,
        textAlign: 'center',
        fontSize: 24,
        lineHeight: '50px',
        borderBottom: `1px solid ${theme.palette.grey[500]}`,
        marginBottom: 20,
        position: 'sticky',
        top: 0,
    })
);

type RowProps = { narrow?: boolean, tall?: boolean };
const FormRow = styled('div')<RowProps>(
    ({ theme, narrow, tall }) => ({
        margin: `${ tall ? '18px' : '15px' } ${ narrow ? '25px' : '22px' }`,
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
        margin: '18px 0px 25px',
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

function ChatSettingModal({ settingId }: ModalPayload) {

    const dispatch = useDispatch();

    const currentSettings = useSelector((state: AppState) => state.setting[settingId!]);

    const { register, handleSubmit, watch, setValue } = useForm<SettingConfig>({
        defaultValues: currentSettings,
    });

    const maxContext = watch('maxContext');
    const temperature = watch('temperature');
    const topP = watch('topP');

    const onSubmit = (data: SettingConfig) => {
        dispatch(updateSetting({
            setting: data,
            settingId,
        }));
        dispatch(closeModal());
    }

    return (
        <Dialog open fullWidth maxWidth='md'>
            
            <Form onSubmit={handleSubmit(onSubmit)}>

                <FormHeader>Chat Settings</FormHeader>

                <FormRow tall>
                    <p style={{ margin: '0px 0px 5px 5px' }}>GPT Model</p>
                    <Select fullWidth>
                        <MenuItem value='gpt-3.5-turbo'>gpt-3.5-turbo</MenuItem>
                        <MenuItem value='gpt-3.5-turbo-16k'>gpt-3.5-turbo-16k</MenuItem>
                    </Select>
                </FormRow>

                <FormRow>
                    <Alert severity='info'>
                        <InfoList>
                            <li>Temperature - higher values will make the output more random, and lower values more deterministic.</li> 
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
                        rows={3}
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

export default ChatSettingModal;