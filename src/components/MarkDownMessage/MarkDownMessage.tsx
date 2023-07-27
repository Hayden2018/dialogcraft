import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import CustomCodeBlock from 'components/CustomCodeBlock/CustomCodeBlock';
import { useMessageSegmentSelector } from './MarkDownMessage.hook';
import { styled } from '@mui/system';

const testText = `
# Lorem Ipsum

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.

- Item 1
- Item 2
- Item 3

## Section 2

Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.


\`\`\`sql
SELECT * FROM atable;
\`\`\`

Some random text here

\`\`\`python
print('Hello World')
\`\`\`
`

const MessageContainer = styled('div')(
    ({ theme }) => ({
        width: 'fit-content',
        borderRadius: 12,
        border: `1px solid ${theme.palette.primary.light}`,
        padding: 20,
        margin: 18,
    })
);

function MarkDownMessage() {

    const renderData = useMessageSegmentSelector(testText);

    return (
        <MessageContainer>
            {
                renderData.map(({ type, content } : { type: string, content: string }) => {
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

export default MarkDownMessage;