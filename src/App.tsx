import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';
import ModalHandler from 'sections/ModalHandler/ModalHandler';
import { useSelector } from "react-redux";
import { AppState } from 'redux/type.d';
import 'App.css';
import GreetingPage from 'sections/GreetingPage/GreetingPage';

function App() {

    const { baseURL, apiKey } = useSelector((state: AppState) => state.setting.global);

    if (baseURL && apiKey) return (
        <>
            <div>
                <ConversationList />
                <ChatInterface />
            </div>
            <ModalHandler /> 
        </>
    )

    return (
        <GreetingPage />
    )
}

export default App;
