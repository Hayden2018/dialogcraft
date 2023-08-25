import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';
import GreetingPage from 'sections/GreetingPage/GreetingPage';
import ModalSwitch from 'sections/ModalSwitch/ModalSwitch';
import { useSelector } from "react-redux";
import { AppState } from 'redux/type.d';
import 'App.css';


function App() {

    const { baseURL, apiKey } = useSelector((state: AppState) => state.setting.global);

    if (baseURL && apiKey) return (
        <>
            <div>
                <ConversationList />
                <ChatInterface />
            </div>
            <ModalSwitch /> 
        </>
    )

    return (
        <GreetingPage />
    )
}

export default App;