const { ipcMain } = require('electron');
const axios = require('axios');

function parseNoisyJSON(noisyString) {
    let parsedObjects = [];
    let bracketCount = 0;
    let jsonString = '';
    let insideString = false;
    let lastClosingIndex = 0;

    for (let i = 0; i < noisyString.length; i++) {
        const char = noisyString[i];
        const prevChar = i > 0 ? noisyString[i - 1] : '';
        const prevPrevChar = i > 1 ? noisyString[i - 2] : '';
        const prevCharNotEscape = prevChar !== '\\' || (prevChar === prevPrevChar);

        if (char === '"' && prevCharNotEscape) {
            insideString = !insideString;
        }
        if (!insideString && char === '{') {
            bracketCount += 1;
        }
        if (bracketCount > 0) {
            jsonString += char;
        }
        if (!insideString && char === '}') {
            bracketCount -= 1;
        }
        if (jsonString.length > 0 && bracketCount === 0 && !insideString) {
            try {
                parsedObjects.push(JSON.parse(jsonString));
                lastClosingIndex = i;
            } catch {
                // The string was not a valid JSON object, so we ignore it
            }
            jsonString = '';
        }
    }
    return {
        jsons: parsedObjects,
        residue: noisyString.slice(lastClosingIndex + 1),
    };
}

async function sendResponseStream(window, {
    urlType,
    apiKey,
    baseURL,
    model,
    messages,
    temperature,
    requestId,
    topP,
}) {
    try {
        const requestConfig = urlType === 'openai' ?
        {
            method: 'post',
            responseType: 'stream',
            url: `${baseURL}/v1/chat/completions`,
            headers: { Authorization: `Bearer ${apiKey}` },
            data: {
                model,
                messages,
                top_p: topP,
                temperature,
                max_tokens: 800,
                stream: true,
            },
        }
            :
        {
            method: 'post',
            responseType: 'stream',
            url: baseURL,
            headers: { 'API-Key': apiKey },
            data: {
                messages,
                top_p: topP,
                temperature,
                max_tokens: 800,
                stream: true,
            },
        };

        const response = await axios(requestConfig);

        let lastChunkTime = new Date().getTime();
        let checkTimeout = setInterval(() => {
            if (new Date().getTime() - lastChunkTime > 9000) {
                clearInterval(checkTimeout);
                window.webContents.send(requestId, { 
                    finish_reason: 'timeout',
                });
            }
        }, 900);

        let residue = '';
        response.data.on('data', (chunk) => {
            lastChunkTime = new Date().getTime();
            const result = parseNoisyJSON(residue + chunk.toString());
            residue = result.residue;
            for (const { choices } of result.jsons) {
                if (choices && choices.length) {
                    window.webContents.send(requestId, choices[0]);
                    if (choices[0].finish_reason === 'stop' || choices[0].finish_details) {
                        clearInterval(checkTimeout);
                    }
                }
            }
        });

    } catch (error) {
        window.webContents.send(requestId, { 
            finish_reason: 'error',
        });
    }
}

function startListenForMessage(window) {
    ipcMain.on('MESSAGE', (event, data) => {
        sendResponseStream(window, data)
    });
}

module.exports = {
    startListenForMessage,
}
