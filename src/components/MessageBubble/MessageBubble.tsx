import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageEditActions, useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';
import { Button } from '@mui/material';

const RightAligner= styled('div')(
    ({ theme }) => ({
        display: 'flex',
        justifyContent: 'right',
        margin: '16px 0px',
    })
);

const LeftAligner= styled('div')(
    ({ theme }) => ({
        display: 'flex',
        justifyContent: 'left',
        margin: '16px 0px',
    })
);

const BotMessageContainer = styled('div')(
    ({ theme }) => ({
        width: 'fit-content',
        maxWidth: 'calc(100% - 150px)',
        borderRadius: 12,
        background: theme.palette.grey[800],
        padding: '10px 12px',
        margin: '0px 18px',
    })
);

const UserMessageContainer = styled('div')(
    ({ theme }) => ({
        textAlign: 'right',
        width: 'fit-content',
        maxWidth: 'calc(100% - 150px)',
        borderRadius: 12,
        padding: '10px 12px',
        margin: '0px 16px',
        background: theme.palette.primary.dark,
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

function MessageBubble(
    { chatId, msgId, msgContent, role, editMode } : 
    { chatId: string, msgId: string, msgContent: string, role: string, editMode: boolean }
) {

    // restoreMessage is null if message is unedited
    const { deleteMessage, regenerateMessage, editMessage, restoreMessage } = useMessageEditActions(chatId, msgId);
    const messageSegments = useMessageSegmentMemo(msgContent);

    if (role === 'user') return (
        <RightAligner>
            <UserMessageContainer>

                <MarginRemoveContainer>
                {
                    messageSegments.map(({ type, content } : { type: string, content: string }) => {
                        if (type === 'text') return (
                            <ReactMarkdown children={content}/>
                        ) 
                        return (
                            <CustomCodeBlock language={type} code={content} />
                        )
                    })
                }
                </MarginRemoveContainer>

                { editMode &&
                    <EditButtonContainer>
                        <EditButton variant='contained' onClick={editMessage}>Edit</EditButton>
                        { restoreMessage &&
                            <EditButton variant='contained' onClick={restoreMessage}>Restore</EditButton>
                        }
                        <EditButton variant='contained' onClick={deleteMessage}>Delete</EditButton>
                    </EditButtonContainer>
                }

            </UserMessageContainer>
        </RightAligner>
    );
    return (
        <LeftAligner>
            <BotMessageContainer>

                <MarginRemoveContainer>
                {
                    messageSegments.map(({ type, content } : { type: string, content: string }) => {
                        if (type === 'text') return (
                            <ReactMarkdown children={content}/>
                        ) 
                        return (
                            <CustomCodeBlock language={type} code={content} />
                        )
                    })
                }
                </MarginRemoveContainer>

                { editMode &&
                    <EditButtonContainer>
                        <EditButton variant='contained' onClick={editMessage}>Edit</EditButton>
                        <EditButton variant='contained' onClick={regenerateMessage}>Regenerate</EditButton>
                        { restoreMessage &&
                            <EditButton variant='contained' onClick={restoreMessage}>Restore</EditButton>
                        }
                        <EditButton variant='contained' onClick={deleteMessage}>Delete</EditButton>
                    </EditButtonContainer>
                }
                
            </BotMessageContainer>
        </LeftAligner>
    );
}

export default MessageBubble;