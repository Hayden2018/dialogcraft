import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App';
import { store, persistor } from 'redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import CssBaseline from '@mui/material/CssBaseline';


const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <CssBaseline />
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);
