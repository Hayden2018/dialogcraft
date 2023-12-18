import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import remarkGfm from 'remark-gfm';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageEditActions, useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import React, { RefObject } from 'react';

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
    ({ theme: { palette, breakpoints } }) => ({
        width: 'fit-content',
        maxWidth: 'calc(100% - 100px)',
        borderRadius: 10,
        background: palette.grey[palette.mode === 'dark' ? 800 : 200],
        padding: '9px 12px',
        margin: '0px 16px',
        color: palette.mode === 'dark' ? '#ffffff' : '#000000',
        overflow: 'hidden',
        '& a': {
            color: palette.primary.main,
        },
        [breakpoints.down(1080)]: {
            maxWidth: 'calc(100% - 30px)',
        }
    })
);

const UserMessageContainer = styled('div')(
    ({ theme: { breakpoints } }) => ({
        textAlign: 'left',
        width: 'fit-content',
        maxWidth: 'calc(100% - 100px)',
        borderRadius: 10,
        padding: '8px 12px',
        margin: '0px 12px',
        color: '#121212',
        background: '#ACDDFF',
        overflow: 'hidden',
        '& a': {
            color: '#036092',
        },
        [breakpoints.down(520)]: {
            maxWidth: 'calc(100% - 60px)',
        }
    })
);

const MarginRemoveContainer = styled('div')(
    ({ theme: { palette } }) => ({
        '& table, th, td': {
            border: `1px solid ${palette.mode === 'dark' ? 'white' : 'black'}`,
            borderCollapse: 'collapse',
            borderSpacing: '0px',
        },
        '& th, td': {
            padding: '4px 6px',
        },
        '& > :first-child': {
            marginTop: 0,
        },  
        '& > :last-child': {
            marginBottom: 0,
        },
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

const MessageBubble = React.memo(({ chatId, msgId, msgContent, role, editMode, forwardRef } : 
    {
        chatId: string,
        msgId: string,
        msgContent: string,
        role: string,
        editMode: boolean,
        generating: boolean,
        forwardRef: RefObject<HTMLDivElement> | null 
    }
) => {
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
                                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} key={index} />
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
                                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} key={index} />
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
});

export default MessageBubble;