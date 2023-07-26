import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { CodeBlock, dracula } from 'react-code-blocks';

function splitMdCodeBlock(mdString: string) {
    const result = [];
    let buffer = '';
    let codeBlockDepth = 0;
  
    // Split the string into lines 
    const lines = mdString.split('\n');
    lines.forEach((line: string)  => {

        // If we encounter a line that related to code block
        if (line.startsWith('```')) {
  
            // If we were already in a code block
            if (codeBlockDepth > 0) {
                // If it is the end of a block (no language modifier)
                if (line === '```') {
                    codeBlockDepth -= 1;
                    // If we're back to the top level, push the buffer to results
                    if (codeBlockDepth === 0) {
                        result.push(buffer + line + '\n');
                        buffer = '';
                    } else {
                        buffer += line + '\n';
                    }
                }
                // If it is the start of a nested block
                else {
                    codeBlockDepth++;
                    buffer += line + '\n';
                }
            }
            // If not in a code block, this line starts a new one
            else {
                // If there was any text before this, add it to the result
                if (buffer) {
                    result.push(buffer);
                    buffer = '';
                }
                codeBlockDepth += 1;
                buffer += line + '\n';
            }
        }
        // Add this line to the current buffer if not a start of a code block
        else {
            buffer += line + '\n';
        }
    });
    // If there was any text or code left in the buffer, add it to the result
    if (buffer) result.push(buffer);
    return result;
}

function processSegments(segments: Array<string>) {
    return segments.map(segment => {
        // If the segment starts with a code block
        if (segment.startsWith('```')) {
            // Find the end of the first line to get the language name
            const endOfFirstLine = segment.indexOf('\n');
            const language = segment.substring(3, endOfFirstLine);
    
            // Find the start of the last line to get the code content
            const startOfLastLine = segment.lastIndexOf('```');
            const code = segment.substring(endOfFirstLine + 1, startOfLastLine);
    
            return {
                type: language,
                content: code
            };
        } 
        // If the segment is not a code block, it's normal text
        else {
            return {
                type: 'text',
                content: segment
            };
        }
    });
}

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

\`\`\`python
print('Hello World')
\`\`\`
`

function MarkDownMessage() {

    const segments = splitMdCodeBlock(testText);
    const renderData = processSegments(segments);

    return (
        <div>
            {
                renderData.map(({ type, content } : { type: string, content: string }) => {
                    if (type === 'text') return (
                        <ReactMarkdown children={content}/>
                    ) 
                    return (
                        <CodeBlock
                            language={type}
                            text={content}
                            theme={dracula}
                            showLineNumbers={false}
                            wrapLongLines={false}
                            startingLineNumber={1}
                            customStyle={{
                                padding: '2px 8px',
                                borderRadius: 10,
                                width: '80%',
                            }}                   
                        />
                    )
                })
            }
        </div>
    );
}

export default MarkDownMessage;