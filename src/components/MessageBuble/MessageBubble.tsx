import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageSegmentMemo } from './MessageBubble.hook';
import { styled } from '@mui/system';

const MessageContainer = styled('div')(
    ({ theme }) => ({
        width: 'fit-content',
        borderRadius: 12,
        border: `1px solid ${theme.palette.primary.light}`,
        padding: '10px 12px',
        margin: 15,
        '& > :first-child': {
            marginTop: 0,
        },  
        '& > :last-child': {
            marginBottom: 0,
        }
    })
);

function MessageBubble(
    { chatId, msgIndex, msgContent } : 
    { chatId: string, msgIndex: number, msgContent: string }
) {
    const messageSegments = useMessageSegmentMemo(msgContent);
    return (
        <MessageContainer>
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
        </MessageContainer>
    );
}

export default MessageBubble;