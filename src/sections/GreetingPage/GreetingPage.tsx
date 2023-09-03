import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { TextField, Button, Alert, LinearProgress, Link } from '@mui/material';
import { styled } from '@mui/system';

import { AppState, SettingConfig, SettingStatus } from 'redux/type.d';
import { updateGlobalSetting } from "saga/actions";
import { ReactComponent as AppIcon } from "./logo.svg";
import { onElectronEnv } from 'utils';

const { shell = null } = onElectronEnv() ? window.require('electron') : { };

const GreetingContainer = styled('div')(
    ({ theme }) => ({
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: '800px',
        gap: 14,
    })
);

const AppTitle= styled('h1')(
    ({ theme: { palette } }) => ({
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
        width: 580,
        margin: '0px auto',
    })
);

const InfoText = styled('p')(
    ({ theme: { palette } }) => ({
        width: 720,
        margin: '0px auto',
        textAlign: 'center',
        color: palette.grey[palette.mode === 'dark' ? 400 : 600],
        fontSize: 14,
        '& > a': {
            cursor: 'pointer',
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
        width: 580,
        margin: '0px auto',
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
const videoUrl = 'https://www.youtube.com/watch?v=aVog4J6nIAU';

function GreetingPage() {

    const dispatch = useDispatch();

    const { baseURL, apiKey, status } = useSelector((state: AppState) => state.setting.global);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { baseURL: baseURL!, apiKey: apiKey! },
    });

    const onSubmit = (data: { apiKey: string, baseURL:string }) => {
        dispatch(updateGlobalSetting(data as SettingConfig));
    }

    const openLink = (url: string) => {
        if (onElectronEnv()) shell.openExternal(url);
        else window.open(url);
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
        <form onSubmit={handleSubmit(onSubmit)}>
            <GreetingContainer>
                <AppTitle>
                    <AppIcon />
                    DialogCraft
                </AppTitle>
                <CredentialInput
                    label='API Base URL'
                    {...register('baseURL', { required: 'API URL is required' })}
                    error={!!errors.baseURL}
                    helperText={errors.baseURL?.message}
                />
                <CredentialInput
                    label='API Key (Bearer token)'
                    type='password'
                    {...register('apiKey', { required: 'API Key is required' })}
                    error={!!errors.apiKey}
                    helperText={errors.apiKey?.message}
                />
                {
                    status === SettingStatus.ERROR &&
                    <ErrorAlert severity='error'>
                        Verification failed. Please check your API credentails and internet connection.
                    </ErrorAlert>
                }
                <SubmitButton variant='contained' type='submit'>
                    Connect
                </SubmitButton>
                <InfoText>
                    If you do not have an API Key. You may refer to <Link onClick={() => openLink(videoUrl)}>this</Link> video on how to get one. 
                </InfoText>
                <InfoText>
                    This is a web demo for DialogCraft. More features such as text streaming only available on <Link onClick={() => openLink(releaseUrl)}>Desktop App</Link>.
                </InfoText>
                <InfoText>
                    Your API Key will be securely stored on this device. This application does not interact with any outside systems except the URL you provided above.
                </InfoText>
            </GreetingContainer>
        </form>
    )
}

export default GreetingPage;