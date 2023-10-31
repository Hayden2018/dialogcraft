import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'App.scss';

import { useSelector } from "react-redux";
import { AppState } from 'redux/type.d';
import { darkTheme, lightTheme } from 'theme';
import { useEffect } from 'react';
import PageSwitch from 'pages/PageSwitch';
import ModalSwitch from 'sections/ModalSwitch/ModalSwitch';
import { onElectronEnv } from 'utils';

function App() {

    const { darkMode } = useSelector((state: AppState) => state.setting.global);
    const theme = darkMode ? darkTheme : lightTheme;

    useEffect(() => {
        if (darkMode) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }, [darkMode]);

    useEffect(() => {
        if (onElectronEnv()) {
            const { ipcRenderer } = window.require('electron');
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.ctrlKey && event.key.toLowerCase() === 'f') {
                    ipcRenderer.send('START-SEARCH');
                }
            }
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            }
        }
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <PageSwitch />
            <ModalSwitch /> 
        </ThemeProvider>
    )
}

export default App;