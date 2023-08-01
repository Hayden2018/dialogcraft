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
    model,
    messages,
}) {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model,
        messages,
        stream: true,
    }, { responseType: 'stream' });

    const stream = completion.data;

    stream.on('data', (chunk) => {
        const dataString = chunk.toString().trim();
        const jsonChunks = parseNoisyJSON(dataString);
        jsonChunks.forEach((data) =>  {
            window.webContents.send('STREAM', data.choices[0]);
        });
    });

    stream.on('error', (err) => {
        console.log(err);
    });
}

function startListenForMessage(window) {
    ipcMain.on('MESSAGE', (event, data) => {
        sendResponseStream(window, data)
    });
}

module.exports = {
    startListenForMessage,
}
