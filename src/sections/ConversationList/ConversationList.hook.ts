import { useSelector } from "react-redux";
import { AppState } from "redux/type";

export const useConversationSelector = () => useSelector((state: AppState) => {
    return state.chatList.chatOrder.map((chatId: string) => ({
        title: state.chats[chatId].title,
        chatId,
    }));
})

