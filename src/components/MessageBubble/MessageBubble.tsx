import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageEditActions, useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import { RefObject } from 'react';

const RightAligner = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        justifyContent: 'right',
        margin: '16px 0px',
    })
);

const LeftAligner = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'left',
        margin: '16px 0px',
    })
);

const BotMessageContainer = styled('div')(
    ({ theme: { palette } }) => ({
        width: 'fit-content',
        maxWidth: 'calc(100% - 100px)',
        borderRadius: 10,
        background: palette.grey[palette.mode === 'dark' ? 800 : 200],
        padding: '8px 12px',
        margin: '0px 16px',
        color: palette.mode === 'dark' ? '#ffffff' : '#000000',
    })
);

const UserMessageContainer = styled('div')(
    ({ theme: { palette } }) => ({
        textAlign: 'left',
        width: 'fit-content',
        maxWidth: 'calc(100% - 100px)',
        borderRadius: 10,
        padding: '7px 12px',
        margin: '0px 12px',
        color: '#121212',
        background: '#AADCFF',
    })
);

const MarginRemoveContainer = styled('div')(
    ({ theme }) => ({
        '& > :first-child': {
            marginTop: 0,
        },  
        '& > :last-child': {
            marginBottom: 0,
        }
    })
);

const EditButtonContainer = styled('div')(
    ({ theme }) => ({
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        height: 25,
        gap: 8,
    })
);

const EditButton = styled(Button)(
    ({ theme }) => ({
        padding: '0px 18px',
        height: 25,
        fontSize: 12,
    })
);

function MessageBubble({ chatId, msgId, msgContent, role, editMode, generating, forwardRef } : 
    { 
        chatId: string,
        msgId: string,
        msgContent: string,
        role: string,
        editMode: boolean,
        generating: boolean,
        forwardRef: RefObject<HTMLDivElement> | null 
    }
) {

    // restoreMessage is null if message is unedited
    const { deleteMessage, regenerateMessage, editMessage, restoreMessage } = useMessageEditActions(chatId, msgId);
    const messageSegments = useMessageSegmentMemo(msgContent || '...');

    if (role === 'user') return (
        <RightAligner ref={forwardRef}>
            <UserMessageContainer>

                <MarginRemoveContainer>
                {
                    messageSegments.map(({ type, content } : { type: string, content: string }, index) => {
                        if (type === 'text') return (
                            <ReactMarkdown children={content} key={index} />
                        ) 
                        return (
                            <CustomCodeBlock language={type} code={content} key={index} />
                        )
                    })
                }
                </MarginRemoveContainer>

                { editMode &&
                    <EditButtonContainer>
                        { restoreMessage &&
                            <EditButton color='info' variant='contained' onClick={restoreMessage}>Restore</EditButton>
                        }
                        <EditButton color='warning' variant='contained' onClick={editMessage}>Edit</EditButton>
                        <EditButton color='error' variant='contained' onClick={deleteMessage}>Delete</EditButton>
                    </EditButtonContainer>
                }

            </UserMessageContainer>
        </RightAligner>
    );
    return (
        <LeftAligner ref={forwardRef}>
            <BotMessageContainer id={msgId}>

                <MarginRemoveContainer>
                {
                    messageSegments.map(({ type, content } : { type: string, content: string }, index) => {
                        if (type === 'text') return (
                            <ReactMarkdown children={content} key={index} />
                        ) 
                        return (
                            <CustomCodeBlock language={type} code={content} key={index} />
                        )
                    })
                }
                </MarginRemoveContainer>

                { editMode &&
                    <EditButtonContainer>
                        <EditButton variant='contained' color='success' onClick={regenerateMessage}>
                            Regenerate
                        </EditButton>
                        { restoreMessage &&
                            <EditButton variant='contained' color='info' onClick={restoreMessage}>Restore</EditButton>
                        }
                        <EditButton variant='contained' color='warning' onClick={editMessage}>Edit</EditButton>
                        <EditButton variant='contained' color='error' onClick={deleteMessage}>Delete</EditButton>
                    </EditButtonContainer>
                }
                
            </BotMessageContainer>
        </LeftAligner>
    );
}

export default MessageBubble;