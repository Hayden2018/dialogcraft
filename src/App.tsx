import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from 'theme';
import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';
import ModalHandler from 'sections/ModalHandler/ModalHandler';
import 'App.css';

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div>
                <ConversationList />
                <ChatInterface />
            </div>
            <ModalHandler />
        </ThemeProvider>
    );
}

export default App;
