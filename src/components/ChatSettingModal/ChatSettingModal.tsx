import Dialog from '@mui/material/Dialog';
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "redux/modalSlice";
import { useForm } from 'react-hook-form';
import { TextField, Slider, Button, Select, MenuItem, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { AppState, ModalPayload, SettingConfig } from 'redux/type';
import { updateChatSetting } from 'redux/settingSlice';
import { useBackButton, useScreenWidth } from 'utils';

const Form = styled('form')(
    ({ theme: { breakpoints } }) => ({
        margin: 'auto',
        padding: '0px 20px',
        width: '95%',
        verticalAlign: 'top',
        [breakpoints.down(600)]: {
            padding: '0px',
        },
        [breakpoints.down(520)]: {
            width: '100%',
        },
    })
);

const FormHeader = styled('div')(
    ({ theme: { palette, breakpoints } }) => ({
        backgroundColor: palette.mode === 'dark' ? '#383838' : '#fdfdfd',
        zIndex: 100,
        textAlign: 'center',
        fontSize: 23,
        lineHeight: '48px',
        paddingTop: 2,
        borderBottom: `1px solid ${palette.grey[500]}`,
        marginBottom: 20,
        position: 'sticky',
        padding: '0px 15px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        [breakpoints.down(600)]: {
            fontSize: 21,
            marginBottom: 18,
        },
        [breakpoints.down(520)]: {
            fontSize: 19,
            marginBottom: 16,
        },
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
        margin: '0px 0px 26px',
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

export default function ChatSettingModal({ settingId }: ModalPayload) {

    const dispatch = useDispatch();

    const { urlType } = useSelector((state: AppState) => state.setting.global);
    const currentSettings = useSelector((state: AppState) => state.setting[settingId!]);
    const chatTitle = useSelector((state: AppState) => state.chats[settingId!].title);

    const screenWidth = useScreenWidth();

    const { register, handleSubmit, watch, setValue } = useForm<SettingConfig>({
        defaultValues: currentSettings,
    });

    const maxContext = watch('maxContext');
    const temperature = watch('temperature');
    const topP = watch('topP');

    const onSubmit = (data: SettingConfig) => {
        data.systemPrompt = data.systemPrompt.trim();
        dispatch(updateChatSetting({
            setting: data,
            settingId,
        }));
        dispatch(closeModal());
    }

    useBackButton(() => dispatch(closeModal()));

    return (
        <Dialog open fullWidth maxWidth='md' fullScreen={screenWidth < 680 ? true : false}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormHeader>Chat Settings - {chatTitle}</FormHeader>
                <FormRow>
                    <Alert severity='info'>
                        <InfoList>
                            <li>Temperature - higher values will make the output more random, and lower values more deterministic.</li> 
                            <li>Top P - the model only considers tokens within top P probability mass.</li>
                        </InfoList>
                    </Alert>
                </FormRow>
                {
                    urlType === 'openai' &&
                    <FormRow>
                        <p style={{ margin: '0px 0px 5px 5px' }}>GPT Model</p>
                        <Select 
                            fullWidth
                            defaultValue={currentSettings.currentModel}
                            onChange={(event) => setValue('currentModel', event.target.value)}
                        >
                            {
                                currentSettings.availableModels.map(
                                    (modelId, index) => <MenuItem key={index} value={modelId}>{modelId}</MenuItem>
                                )
                            }
                        </Select>
                    </FormRow>
                }
                <FormRow narrow>
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
                <FormRow narrow>
                    <SliderTop>
                        <span>Top P</span>
                        <span>{topP}</span>
                    </SliderTop>
                    <Slider
                        min={0}
                        max={100}
                        value={topP * 100}
                        onChange={(_, newValue) => setValue('topP', newValue as number / 100)}
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
                <FormRow narrow>
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