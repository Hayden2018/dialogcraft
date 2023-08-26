import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import 'App.scss';

import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';
import GreetingPage from 'sections/GreetingPage/GreetingPage';
import ModalSwitch from 'sections/ModalSwitch/ModalSwitch';
import { useSelector } from "react-redux";
import { AppState } from 'redux/type.d';
import { darkTheme, lightTheme } from 'theme';
import { useEffect } from 'react';



function App() {

    const { baseURL, apiKey, darkMode } = useSelector((state: AppState) => state.setting.global);
    const theme = darkMode ? darkTheme : lightTheme;

    useEffect(() => {
        if (darkMode) document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }, [darkMode]);

    if (baseURL && apiKey) return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div>
                <ConversationList />
                <ChatInterface />
            </div>
            <ModalSwitch /> 
        </ThemeProvider>
    )

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <GreetingPage />
        </ThemeProvider>
    )
}

export default App;