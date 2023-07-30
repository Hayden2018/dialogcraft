const { ipcMain } = require('electron');
import { Configuration, OpenAIApi } from "openai";

async function sendChatResponseStream(window, {
    apiKey,
    model,
    messages,
}) {

    const configuration = new Configuration({ apiKey });
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createChatCompletion({
        model,
        messages,
        stream: true,
    }, { responseType: 'stream' });

    const stream = completion.data;

    stream.on('data', (chunk) => {
        const payload = chunk.toString().trim();
        const dataString = payload.replace('data: ', '');
        if (dataString) win.webContents.send(dataString);
    });

    stream.on('error', (err) => {
        console.log(err);
    });
}


export { }

