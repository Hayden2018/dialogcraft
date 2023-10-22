import { styled } from '@mui/system';
import useChatTitleWithEdit from './ChatTitleBox.hook';
import { useDispatch } from 'react-redux';
import { setCurrentChat } from 'redux/chatListSlice';
import { ReactComponent as EditIcon } from './edit.svg';
import { ReactComponent as DeleteIcon } from './bin.svg';

interface ContainerProps {
    isCurrent: boolean;
}

const TitleContainer = styled('div')<ContainerProps>(
    ({ isCurrent, theme: { palette, breakpoints } }) => ({
        width: 'calc(100% - 20px)',
        margin: '7px auto',
        padding: '9px 12px 1px',
        overflow: 'auto',
        borderRadius: 8,
        height: 47,
        background: isCurrent && palette.grey[palette.mode === 'dark' ? 700 : 300],
        ':hover': {
            background: palette.grey[palette.mode === 'dark' ? 800 : 200],
            'div': {
                width: 'calc(100% - 60px)',
            },
            'svg': {
                display: 'inline-block',
            },
        },
        [breakpoints.down(800)]: {
            'div': {
                width: 'calc(100% - 60px)',
            },
            'svg': {
                display: 'inline-block',
            },
        }
    })
);

const Title = styled('div')(
    ({ theme }) => ({
        width: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        cursor: 'default',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    })
);

const EditButton = styled(EditIcon)(
    ({ theme: { palette } }) => ({
        display: 'none',
        width: 20,
        height: 20,
        margin: '3px 0px 0px 10px',
        stroke: palette.grey[500],
        '&:hover': {
            stroke: palette.grey[palette.mode === 'dark' ? 300 : 700],
        }
    })
);

const DeleteButton = styled(DeleteIcon)(
    ({ theme: { palette } }) => ({
        display: 'none',
        width: 20,
        height: 20,
        margin: '3px 0px 0px 10px',
        fill: palette.grey[500],
        '&:hover': {
            fill: palette.grey[palette.mode === 'dark' ? 300 : 700],
        }
    })
);


function ChatTitleBox({
    chatId,
    isCurrent,
    setMenuOpen,
} : {
    chatId: string,
    isCurrent: boolean,
    setMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>,
}) {
    const dispatch = useDispatch();
    const { title, renameTitle, deleteChat } = useChatTitleWithEdit(chatId);

    const boxClicked = () => {
        dispatch(setCurrentChat(chatId));
        if (setMenuOpen) setMenuOpen(false);
    }

    return (
        <TitleContainer isCurrent={isCurrent} onClick={boxClicked}>
            <Title>{title}</Title>
            <EditButton onClick={renameTitle} />
            <DeleteButton onClick={deleteChat} />
        </TitleContainer>
    );
}

export default ChatTitleBox;