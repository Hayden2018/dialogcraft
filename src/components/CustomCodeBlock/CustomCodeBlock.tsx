import { styled, useTheme } from '@mui/system';
import { CodeBlock, vs2015, googlecode } from 'react-code-blocks';

const CodeBlockHeader = styled('div')(
    ({ theme: { palette } }) => ({
        fontSize: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        color: palette.text.primary,
        backgroundColor: palette.grey[palette.mode === 'dark' ? 700 : 300],
        padding: '10px 15px',
    })
);

function CustomCodeBlock({ language, code, style = {} } : { language: string , code: string, style?: object }) {

    const { palette } = useTheme();

    return (
        <div style={style}>
            <CodeBlockHeader>
                {language}
            </CodeBlockHeader>
            <CodeBlock
                language={language}
                text={code}
                theme={palette.mode === 'dark' ? vs2015 : googlecode}
                showLineNumbers={false}
                wrapLongLines={false}
                startingLineNumber={1}
                customStyle={{
                    padding: '5px 8px',
                    borderRadius: 0,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10,
                }}          
            />
        </div>
    );
}

export default CustomCodeBlock;