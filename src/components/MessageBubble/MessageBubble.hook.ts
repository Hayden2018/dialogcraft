import { useMemo } from "react";

function splitMdCodeBlock(mdString: string) {
    const result = [];
    let buffer = '';
    let codeBlockDepth = 0;
  
    // Split the string into lines 
    const lines = mdString.split('\n');
    lines.forEach((line: string)  => {

        if (line.startsWith('```')) {
            // If we were already in a code block
            if (codeBlockDepth > 0) {
                // If it is the end of a block (no language modifier)
                if (line === '```') {
                    codeBlockDepth -= 1;
                    // If we are back to the top level, push the buffer to results
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
    // If there was any text or code left in the buffer add it to the result
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
            const startOfLastLine = segment.lastIndexOf('```');

            // No closing due to streaming partical result
            if (endOfFirstLine > startOfLastLine) 
                return {
                    type: language,
                    content: segment.substring(endOfFirstLine + 1)
                }
            // Normal case
            else 
                return {
                    type: language,
                    content: segment.substring(endOfFirstLine + 1, startOfLastLine)
                }
        } 
        // The segment is not a code block
        else {
            return {
                type: 'text',
                content: segment.replace(/\n/g, '  \n') // Replace for following strict markdown spacing
            };
        }
    });
}

export const useMessageSegmentMemo = (markDown: string) => useMemo(() => {
    const messageSegments = splitMdCodeBlock(markDown);
    return processSegments(messageSegments);
}, [markDown])