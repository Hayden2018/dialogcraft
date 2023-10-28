import { useState } from 'react';
import ConversationList from 'sections/ConversationList/ConversationList';
import ChatInterface from 'sections/ChatInterface/ChatInterface';


function Chat() {

    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    return (
        <div id='app'>
            <ConversationList setMenuOpen={setMenuOpen} menuOpen={menuOpen} />
            <ChatInterface setMenuOpen={setMenuOpen} />
        </div>
    )
}

export default Chat;