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

const EndpointTypeChooser = styled(Tabs)(
    ({ theme }) => ({
        minHeight: '32px',
        height: 32,
        maxWidth: '580px',
        width: '100%',
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
        [breakpoints.down(500)]: {
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
const videoUrl = 'https://www.youtube.com/watch?v=aVog4J6nIAU';
const openTarget = onElectronEnv() ? '' : '_blank';

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
        <form onSubmit={handleSubmit(onSubmit)} id='app'>
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
                    If you do not have an OpenAI API key refer to <Link target={openTarget} href={videoUrl}>this</Link> video on how to get one. 
                </InfoText>
                {
                    onElectronEnv() ||
                    <InfoText>
                        You are using the web version of DialogCraft. More features available on <Link target={openTarget} href={releaseUrl}>desktop app</Link>.
                    </InfoText>
                }
                <InfoText>
                    Your API key will be stored on this device. This application does not interact with system other than the provided URL.
                </InfoText>
            </GreetingContainer>
        </form>
    )
    else return (
        <form onSubmit={handleSubmit(onSubmit)} id='app'>
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
                    Please provide the full URL to your Azure OpenAI service deployment.
                </InfoText>
                {
                    onElectronEnv() ||
                    <InfoText>
                        You are using the web version of DialogCraft. More features available on <Link target={openTarget} href={releaseUrl}>desktop app</Link>.
                    </InfoText>
                }
                <InfoText>
                    Your API key will be stored on this device. This application does not interact with system other than the provided URL.
                </InfoText>
            </GreetingContainer>
        </form>
    )
}