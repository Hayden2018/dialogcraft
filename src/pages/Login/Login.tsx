import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Alert, LinearProgress, Link } from '@mui/material';
import { styled } from '@mui/system';

import { AppState, SettingConfig, SettingStatus } from 'redux/type.d';
import { updateGlobalSetting } from "saga/actions";
import { ReactComponent as AppIcon } from "./logo.svg";
import { onElectronEnv } from 'utils';
import { OPENROUTER_DEFAULT_BASE_URL } from 'redux/settingSlice';

const GreetingContainer = styled('div')(
    ({ theme }) => ({
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0px 15px',
        gap: 12,
    })
);

const AppTitle = styled('h1')(
    ({ theme: { palette } }) => ({
        margin: '10px 0px 5px',
        textAlign: 'center',
        color: palette.grey[palette.mode === 'dark' ? 200 : 800],
        '& > svg': {
            height: 45,
            width: 45,
            marginRight: 12,
            verticalAlign: 'top',
        }
    })
);

const CredentialInput = styled(TextField)(
    ({ theme }) => ({
        maxWidth: '580px',
        width: '100%',
        margin: '0px auto',
    })
);

const InfoText = styled('p')(
    ({ theme: { palette, breakpoints } }) => ({
        margin: '0px auto',
        textAlign: 'center',
        color: palette.grey[palette.mode === 'dark' ? 400 : 600],
        fontSize: 14,
        '& > a': {
            cursor: 'pointer',
        },
        [breakpoints.down(520)]: {
            fontSize: 13,
        }
    })
);

const ProgressContainer = styled('div')(
    ({ theme }) => ({
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

const ErrorAlert = styled(Alert)(
    ({ theme }) => ({
        margin: '0px auto',
        maxWidth: '580px',
        width: '100%',
        '& > a': {
            color: theme.palette.error.main,
            '&:hover': {
                textDecoration: 'underline',
            },
        }
    })
);

const SubmitButton = styled(Button)(
    ({ theme }) => ({
        width: 200,
        height: 38,
        margin: '18px auto 22px',
    })
);

const releaseUrl = 'https://github.com/Hayden2018/dialogcraft/releases';
const openRouterKeysUrl = 'https://openrouter.ai/keys';
const openTarget = onElectronEnv() ? '' : '_blank';

export default function Login() {

    const dispatch = useDispatch();
    const { status } = useSelector((state: AppState) => state.setting.global);

    const { handleSubmit, reset, control, formState: { isDirty } } = useForm({
        defaultValues: {
            baseURL: OPENROUTER_DEFAULT_BASE_URL,
            apiKey: '',
        },
    });

    const onSubmit = (data: { apiKey: string, baseURL: string }) => {
        if (data.baseURL && data.apiKey) {
            dispatch(updateGlobalSetting(data as SettingConfig));
            reset(data);
        }
    }

    if (status === SettingStatus.VERIFYING) return (
        <GreetingContainer>
            <ProgressContainer>
                <p>Verifying your API credentials...</p>
                <LinearProgress />
            </ProgressContainer>
        </GreetingContainer>
    )

    return (
        <form onSubmit={handleSubmit(onSubmit)} id='app'>
            <GreetingContainer>
                <AppTitle>
                    <AppIcon />
                    DialogCraft
                </AppTitle>
                <Controller
                    name='baseURL'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} label='API Base URL' />}
                />
                <Controller
                    name='apiKey'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} type='password' label='OpenRouter API Key' />}
                />
                {
                    (status === SettingStatus.ERROR && !isDirty) &&
                    <ErrorAlert severity='error'>
                        Verification failed. Please check your API credentials and internet connection.
                    </ErrorAlert>
                }
                <SubmitButton variant='contained' type='submit'>
                    Connect
                </SubmitButton>
                <InfoText>
                    Get an OpenRouter API key from <Link target={openTarget} href={openRouterKeysUrl}>openrouter.ai/keys</Link>.
                    The base URL defaults to OpenRouter and can be overridden for compatible proxies.
                </InfoText>
                {
                    onElectronEnv() ||
                    <InfoText>
                        You are using the web version of DialogCraft. More features available on <Link target={openTarget} href={releaseUrl}>desktop app</Link>.
                    </InfoText>
                }
                <InfoText>
                    Your API key will be stored on this device. This application does not interact with systems other than the provided URL.
                </InfoText>
            </GreetingContainer>
        </form>
    )
}
