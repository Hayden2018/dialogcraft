import { styled } from '@mui/system';
import useChatTitleWithEdit from './ChatTitleBox.hook';
import { useDispatch } from 'react-redux';
import { setCurrentChat } from 'redux/chatListSlice';
import { useEffect, useRef } from 'react';
import { ReactComponent as EditIcon } from './edit.svg';
import { ReactComponent as DeleteIcon } from './bin.svg';
import { ReactComponent as TickIcon } from './tick.svg';
import { ReactComponent as CrossIcon } from './cross.svg';

interface ContainerProps {
    edit: boolean;
    isCurrent?: boolean;
}

const TitleContainer = styled('div')<ContainerProps>(
    ({ theme: { palette }, edit, isCurrent }) => ({
        display: edit ? 'none' : 'block',
        width: 'calc(100% - 20px)',
        margin: '8px auto',
        padding: '8px 12px 2px',
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
        }
    })
);

const TitleEditContainer = styled('div')<ContainerProps>(
    ({ theme: { palette }, edit }) => ({
        display: edit ? 'block' : 'none',
        width: 'calc(100% - 20px)',
        margin: '8px auto',
        padding: '8px 12px 2px',
        borderRadius: 8,
        height: 47,
        background: palette.grey[palette.mode === 'dark' ? 700 : 300],
    })
);

const Title = styled('div')(
    ({ theme: { palette } }) => ({
        width: '100%',
        display: 'inline-block',
        verticalAlign: 'top',
        cursor: 'default',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: palette.mode === 'dark' ? '#ffffff' : '#121212',
    })
);

const TitleInput = styled('input')(
    ({ theme: { palette } }) => ({
        verticalAlign: 'top',
        marginTop: 3,
        fontSize: 'inherit',
        color: palette.mode === 'dark' ? '#ffffff' : '#121212',
        width: 'calc(100% - 60px)',
        background: 'transparent',
        borderBottom: `1px solid ${palette.grey[500]}`,
        border: 'none',
        outline: 'none',
        '&:focus': {
            borderBottom: `1px solid ${palette.grey[500]}`,
        },
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

const CrossButton = styled(CrossIcon)(
    ({ theme: { palette } }) => ({
        display: 'inline-block',
        width: 18,
        height: 18,
        margin: '4px 0px 0px 10px',
        fill: palette.grey[500],
        '&:hover': {
            fill: palette.grey[palette.mode === 'dark' ? 300 : 700],
        }
    })
);

const TickButton = styled(TickIcon)(
    ({ theme: { palette } }) => ({
        display: 'inline-block',
        width: 20,
        height: 20,
        margin: '3px 0px 0px 10px',
        fill: palette.grey[500],
        '&:hover': {
            fill: palette.grey[palette.mode === 'dark' ? 300 : 700],
        }
    })
);

const hasParent = (child: Node | null, parent: Node | null): boolean => {
    let element = child;
    while (element) {
        if (element === parent) return true;
        if (element instanceof SVGElement) {
            element = element.parentElement;
        } else {
            element = element.parentNode;
        }
    }
    return false;
}

function ChatTitleBox({ chatId, isCurrent } : { chatId: string, isCurrent: boolean }) {

    const dispatch = useDispatch();
    const editBoxRef = useRef<HTMLInputElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const {         
        title,
        isEditing,
        onEdit,
        startEdit,
        confirmEdit,
        onKeyDown,
        abortEdit,
        deleteChat,
    } = useChatTitleWithEdit(chatId);

    useEffect(() => {
        function unFocus(event: globalThis.MouseEvent) {
            if (!hasParent(event.target as Node, editBoxRef.current)) {
                abortEdit();
            }
        }
        document.addEventListener('click', unFocus);
        return () => document.removeEventListener('click', unFocus);
    }, []);

    useEffect(() => {
        if (isEditing) inputRef.current!.focus();
    }, [isEditing]);

    const boxClicked = () => dispatch(setCurrentChat(chatId));

    // Keep everything in DOM and hide using display none
    // Required for hasParent function to work properly
    return (
        <div ref={editBoxRef} onClick={boxClicked}>

            <TitleEditContainer edit={isEditing}>
                <TitleInput value={title} onChange={onEdit} onKeyDown={onKeyDown} ref={inputRef} />
                <TickButton onClick={confirmEdit} />
                <CrossButton onClick={abortEdit} />
            </TitleEditContainer>

            <TitleContainer edit={isEditing} isCurrent={isCurrent}>
                <Title>{title}</Title>
                <EditButton onClick={startEdit} />
                <DeleteButton onClick={deleteChat} />
            </TitleContainer>

        </div>
    );
}

export default ChatTitleBox;