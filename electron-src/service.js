const { ipcMain } = require('electron');
const axios = require('axios');

function parseNoisyJSON(noisyString) {
    let parsedObjects = [];
    let bracketCount = 0;
    let jsonString = '';
    let insideString = false;

    for (let i = 0; i < noisyString.length; i++) {
        let char = noisyString[i];
        let prevChar = i > 0 ? noisyString[i - 1] : null;

        if (char === '"' && prevChar !== '\\') {
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
            } catch {
                // The string was not a valid JSON object, so we ignore it
            }
            jsonString = '';
        }
    }
    return parsedObjects;
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
    
        response.data.on('data', (chunk) => {
            lastChunkTime = new Date().getTime();
            const jsonChunks = parseNoisyJSON(chunk.toString());
            for (const { choices } of jsonChunks) {
                if (choices && choices.length) {
                    window.webContents.send(requestId, choices[0]);
                    if (choices[0].finish_reason === 'stop') clearInterval(checkTimeout);
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
