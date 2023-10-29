import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'App.scss';

import { useSelector } from "react-redux";
import { AppState } from 'redux/type.d';
import { darkTheme, lightTheme } from 'theme';
import { useEffect } from 'react';
import PageSwitch from 'pages/PageSwitch';
import ModalSwitch from 'sections/ModalSwitch/ModalSwitch';

function App() {

    const { darkMode } = useSelector((state: AppState) => state.setting.global);
    const theme = darkMode ? darkTheme : lightTheme;

    useEffect(() => {
        if (darkMode) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }, [darkMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <PageSwitch />
            <ModalSwitch /> 
        </ThemeProvider>
    )
}

export default App;