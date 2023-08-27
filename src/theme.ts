import { createTheme, Theme } from '@mui/material/styles';

export const darkTheme: Theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            paper: '#121212',
            default: '#121212',
        }
    }
});

export const lightTheme: Theme = createTheme({
    palette: { 
        mode: 'light',
        background: {
            paper: '#FCFCFC',
            default: '#FCFCFC',
        }
    }
});