import { styled } from '@mui/system';
import { CodeBlock, vs2015 } from 'react-code-blocks';

const CodeBlockHeader = styled('div')(
    ({ theme }) => ({
        fontSize: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        color: theme.palette.text.primary,
        backgroundColor: '#323232',
        padding: '10px 12px',
    })
);

function CustomCodeBlock({ language, code, style = {} } : { language: string , code: string, style?: object }) {

    return (
        <div style={style}>
            <CodeBlockHeader>
                {language}
            </CodeBlockHeader>
            <CodeBlock
                language={language}
                text={code}
                theme={vs2015}
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