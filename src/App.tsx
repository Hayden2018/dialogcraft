import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from 'theme';
import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';

function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div>
                <ConversationList />
                <ChatInterface />
            </div>
        </ThemeProvider>
    );
}

export default App;
