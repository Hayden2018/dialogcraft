import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Alert, LinearProgress, Link, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/system';

import { AppState, SettingConfig, SettingStatus } from 'redux/type.d';
import { updateGlobalSetting } from "saga/actions";
import { ReactComponent as AppIcon } from "./logo.svg";
import { onElectronEnv } from 'utils';
import { useEffect } from 'react';

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

const EndpointTypeChooser = styled(Tabs)(
    ({ theme: { palette } }) => ({
        minHeight: '32px',
        height: 32,
        width: 580,
        margin: '0px auto',
        marginBottom: '5px',
        '& div': {
            height: 32,
            minHeight: '32px',
        },
        '& button': {
            width: 75,
            minWidth: '75px',
            height: 32,
            minHeight: '32px',
            fontSize: '12px',
        },
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
        width: 800,
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

const openLink = (url: string) => {
    if (onElectronEnv()) {
        const { shell } = window.require('electron');
        shell.openExternal(url);
    } else {
        window.open(url);
    }
}

export default function GreetingPage() {

    const dispatch = useDispatch();
    const { status } = useSelector((state: AppState) => state.setting.global);

    const { handleSubmit, watch, setValue, reset, control, formState: { isDirty } } = useForm({
        defaultValues: {
            baseURL: 'https://api.openai.com',
            apiKey: '',
            urlType: 'openai',
        },
    });

    const urlType = watch('urlType');
    const baseURL = watch('baseURL');
    const apiKey = watch('apiKey');

    useEffect(() => {
        if (urlType === 'openai') {
            setValue('baseURL', 'https://api.openai.com');
            setValue('apiKey', '');
        } else {
            setValue('baseURL', '');
            setValue('apiKey', '');
        }
    }, [setValue, urlType]);

    const onSubmit = (data: { apiKey: string, baseURL:string }) => {
        if (baseURL && apiKey) {
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

    if (urlType === 'openai') return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GreetingContainer>
                <AppTitle>
                    <AppIcon />
                    DialogCraft
                </AppTitle>
                <EndpointTypeChooser
                    value={urlType}
                    onChange={(_, value) => setValue('urlType', value)}
                >
                    <Tab value='openai' label='OpenAI' />
                    <Tab value='azure' label='Azure' />
                </EndpointTypeChooser>
                <Controller
                    name='baseURL'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} label='API Base URL' />}
                />
                <Controller
                    name='apiKey'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} type='password' label='API Key (Bearer token)' />}
                />
                {
                    (status === SettingStatus.ERROR && !isDirty) &&
                    <ErrorAlert severity='error'>
                        Verification failed. Please check your API credentails and internet connection.
                    </ErrorAlert>
                }
                <SubmitButton variant='contained' type='submit'>
                    Connect
                </SubmitButton>
                <InfoText>
                    If you do not have an OpenAI API Key. You may refer to <Link onClick={() => openLink(videoUrl)}>this</Link> video on how to get one. 
                </InfoText>
                <InfoText>
                    Your API Key will be stored on this device. This application does not interact with system other than the provided URL.
                </InfoText>
                {
                    onElectronEnv() ||
                    <InfoText>
                        You are using the web version of DialogCraft. More features available on <Link onClick={() => openLink(releaseUrl)}>desktop app</Link>.
                    </InfoText>
                }
            </GreetingContainer>
        </form>
    )
    else return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <GreetingContainer>
                <AppTitle>
                    <AppIcon />
                    DialogCraft
                </AppTitle>
                <EndpointTypeChooser
                    value={urlType}
                    onChange={(_, value) => setValue('urlType', value)}
                >
                    <Tab value='openai' label='OpenAI' />
                    <Tab value='azure' label='Azure' />
                </EndpointTypeChooser>
                <Controller
                    name='baseURL'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} label='Azure OpenAI Endpoint'/>}
                />
                <Controller
                    name='apiKey'
                    control={control}
                    render={({ field }) => <CredentialInput {...field} type='password' label='API Key'/>}
                />
                {
                    (status === SettingStatus.ERROR && !isDirty) &&
                    <ErrorAlert severity='error'>
                        Verification failed. Please check your API credentails and internet connection.
                    </ErrorAlert>
                }
                <SubmitButton variant='contained' type='submit'>
                    Connect
                </SubmitButton>
                <InfoText>
                    You are using this app with a Azure OpenAI service deployment.
                </InfoText>
                <InfoText>
                    Your API Key will be stored on this device. This application does not interact with system other than the provided URL.
                </InfoText>
                {
                    onElectronEnv() ||
                    <InfoText>
                        You are using the web version of DialogCraft. More features available on <Link onClick={() => openLink(releaseUrl)}>desktop app</Link>.
                    </InfoText>
                }
            </GreetingContainer>
        </form>
    )
}