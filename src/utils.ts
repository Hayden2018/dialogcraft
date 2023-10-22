import { useState, useEffect } from 'react';

export function useScreenWidth() {
    const [width, setWidth] = useState<number>(window.innerWidth);
    const handleResize = () => setWidth(window.innerWidth);
    
    window.addEventListener('resize', handleResize);
    useEffect(() => () => window.removeEventListener('resize', handleResize), []);

    return width;
}


export function onElectronEnv(): boolean {
    return typeof process !== 'undefined' && !!process.versions && !!process.versions.electron;
}

export const chatTitlePrompt = 
    'Create a short title with three words or less for the conversation so far, the title should be in the same language as the conversation. Directly reply with the title without any other text such as "Title" or quotation mark.';