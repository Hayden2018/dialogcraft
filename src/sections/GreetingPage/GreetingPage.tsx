import { useDispatch, useSelector } from "react-redux";
import { useForm } from 'react-hook-form';
import { TextField, Button, Alert, LinearProgress } from '@mui/material';
import { styled } from '@mui/system';
import { AppState, SettingConfig } from 'redux/type.d';
import { updateGlobalSetting } from "saga/actions";

const { shell } = window.require('electron');

const GreetingContainer = styled('div')(
    ({ theme }) => ({
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 15,
    })
);

const CredentialInput = styled(TextField)(
    ({ theme }) => ({
        width: 580,
        margin: '0px auto',
    })
);

const InfoText = styled('p')(
    ({ theme }) => ({
        width: 720,
        margin: '0px auto',
        textAlign: 'center',
        color: theme.palette.grey[400],
        fontSize: 14,
        '& > a': {
            cursor: 'pointer',
            color: theme.palette.primary.main,
            '&:hover': {
                textDecoration: 'underline',
            },
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

const openAIDocUrl = 'https://platform.openai.com/docs/api-reference/completions';

function GreetingPage() {

    const dispatch = useDispatch();

    const { baseURL, apiKey, status } = useSelector((state: AppState) => state.setting.global);

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: { baseURL: baseURL!, apiKey: apiKey! },
    });

    const onSubmit = (data: { apiKey: string, baseURL:string }) => {
        dispatch(updateGlobalSetting(data as SettingConfig));
    }

    if (status === 'verifying') return (
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
                <CredentialInput
                    label='API URL'
                    {...register('baseURL', { required: 'API URL is required' })}
                    error={!!errors.baseURL}
                    helperText={errors.baseURL?.message}
                />
                <CredentialInput
                    label='API Key'
                    type='password'
                    {...register('apiKey', { required: 'API Key is required' })}
                    error={!!errors.apiKey}
                    helperText={errors.apiKey?.message}
                />
                {
                    status === 'error' &&
                    <ErrorAlert severity='error'>
                        Verification failed, please check your API credentails and internet connection.
                    </ErrorAlert>
                }
                <SubmitButton variant='contained' type='submit'>Confirm</SubmitButton>
                <InfoText>
                    The API URL should be from OpenAI or strictly follow the standard specified in OpenAI <a onClick={() => shell.openExternal(openAIDocUrl)}>documentation</a>.
                </InfoText>
                <InfoText>
                    Your API Key will be stored locally on this machine. This app does not communicate with external components except the URL specified above.
                </InfoText>
            </GreetingContainer>
        </form>
    )
}

export default GreetingPage;