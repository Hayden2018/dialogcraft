import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';

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
        '& > :first-child': {
            marginTop: 0,
        },  
        '& > :last-child': {
            marginBottom: 0,
        }
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
        '& > :first-child': {
            marginTop: 0,
        },  
        '& > :last-child': {
            marginBottom: 0,
        }
    })
);

function MessageBubble(
    { chatId, msgId, msgContent, role, editMode } : 
    { chatId: string, msgId: string, msgContent: string, role: string, editMode: boolean }
) {
    const messageSegments = useMessageSegmentMemo(msgContent);
    if (role === 'user') return (
        <RightAligner>
            <UserMessageContainer>
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
            </UserMessageContainer>
        </RightAligner>
    );
    return (
        <LeftAligner>
            <BotMessageContainer>
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
            </BotMessageContainer>
        </LeftAligner>
    );
}

export default MessageBubble;