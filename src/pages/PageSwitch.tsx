import { useSelector } from "react-redux";
import { AppState, PageType } from "redux/type.d";

import Login from "./Login/Login";
import Chat from "./Chat/Chat";
import GlobalSetting from "pages/GlobalSetting/GlobalSetting";
import ResetAppWarning from "./ResetAppWarning/ResetAppWarning";
import ImportChats from "components/ChatImport/ChatImport";

function PageSwitch() {

    const { current } = useSelector((state: AppState) => state.page);

    switch (current) {
        case PageType.LOGIN:
            return <Login />;
        case PageType.CHAT:
            return <Chat />;
        case PageType.SETTING_GLOBAL:
            return <GlobalSetting />;
        case PageType.SETTING_RESET:
            return <ResetAppWarning />;
        case PageType.SETTING_IMPORT:
            return <ImportChats />;
        default:
            return <Login />;
    }
}


export default PageSwitch;