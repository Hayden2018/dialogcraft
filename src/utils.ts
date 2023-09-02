export function onElectronEnv(): boolean {
    return typeof process !== 'undefined' && !!process.versions && !!process.versions.electron;
}

export const chatTitlePrompt = 
    'Create a short title for the conversation we have so far, the title should be in the same language as the conversation. Limit it to three words or less. Directly reply with the title without any other text such as "Title" or quotation mark.';