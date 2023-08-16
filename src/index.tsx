import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App';
import store from 'redux/store';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { darkTheme } from 'theme';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
);
