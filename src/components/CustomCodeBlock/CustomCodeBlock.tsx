import { Button } from '@mui/material';
import { styled, useTheme } from '@mui/system';
import { useState } from 'react';
import { CodeBlock, vs2015, googlecode } from 'react-code-blocks';

const CodeBlockHeader = styled('div')(
    ({ theme: { palette } }) => ({
        fontSize: 16,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        color: palette.text.primary,
        backgroundColor: palette.grey[palette.mode === 'dark' ? 700 : 300],
        lineHeight: '28px',
        minHeight: 44,
        padding: '8px 16px',
        position: 'relative',
    })
);

const CopyButton = styled(Button)(
    ({ theme: { palette }, color }) => ({
        position: 'absolute',
        right: 10,
        padding: '0px 14px',
        width: 'fit-content',
        height: 28,
        textTransform: 'none',
        minWidth: 0,
        borderRadius: 6,
    })
);

function CustomCodeBlock({ language, code, style = {} } : { language: string , code: string, style?: object }) {

    const { palette } = useTheme();
    const [copySuccess, setCopySucess] = useState<boolean>(false);

    const handleCopy = () => {
        if (copySuccess) return;
        navigator.clipboard.writeText(code);
        setCopySucess(true);
        setTimeout(() => setCopySucess(false), 1200);
    }

    return (
        <div style={{ minWidth: 200, marginBottom: 8, ...style }}>
            <CodeBlockHeader>
                {language || ' '}
                <CopyButton
                    variant='contained'
                    onClick={handleCopy}
                    color={copySuccess ? 'success' : 'primary'}
                >
                    { copySuccess ? 'Copy Successful' : 'Copy' }
                </CopyButton>
            </CodeBlockHeader>
            <div style={{fontFamily: 'Consolas', fontSize: '15px'}}>
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
        </div>
    );
}

export default CustomCodeBlock;