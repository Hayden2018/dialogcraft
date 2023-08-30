const { ipcMain } = require('electron');
const { Configuration, OpenAIApi } = require("openai");

function parseNoisyJSON(noisyString) {
    let parsedObjects = [];
    let bracketCount = 0;
    let jsonString = '';
    let insideString = false;

    for (let i = 0; i < noisyString.length; i++) {
        let char = noisyString[i];
        let prevChar = i > 0 ? noisyString[i - 1] : null;

        if (char === '\"' && prevChar !== '\\') {
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
            } catch (e) {
                // The string was not a valid JSON object, so we ignore it
            }
            jsonString = '';
        }
    }
    return parsedObjects;
}

async function sendResponseStream(window, {
    apiKey,
    baseURL,
    model,
    messages,
    temperature,
    requestId,
    topP,
}) {
    try {
        const configuration = new Configuration({ apiKey, basePath: `${baseURL}/v1/` });
        const openai = new OpenAIApi(configuration);
    
        const completion = await openai.createChatCompletion({
            model,
            messages,
            stream: true,
            temperature,
            top_p: topP,
        }, { responseType: 'stream' });
    
        const stream = completion.data;

        let lastChunkTime = new Date().getTime();
        let timeoutChecker = setInterval(() => {
            if (new Date().getTime() - lastChunkTime > 6000) {
                clearInterval(timeoutChecker);
                window.webContents.send(requestId, { 
                    finish_reason: 'error',
                    delta: { },
                });
            }
        }, 1000);
    
        stream.on('data', (chunk) => {
            const jsonChunks = parseNoisyJSON(chunk.toString());
            jsonChunks.forEach((data) => {
                if (!data.choices || data.choices.length === 0) return;
                window.webContents.send(requestId, data.choices[0]);
                lastChunkTime = new Date().getTime();
                if (data.choices[0].finish_reason === 'stop') {
                    clearInterval(timeoutChecker);
                }
            });
        });

    } catch (error) {
        window.webContents.send(requestId, { 
            finish_reason: 'error',
            delta: { },
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
