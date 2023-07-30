const path = require('path');
const url = require('url');

const { app, BrowserWindow } = require('electron');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true,
        },
    });

    const appURL = app.isPackaged ? url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: "file:",
        slashes: true,
    }) : 'http://localhost:3000';

    win.loadURL(appURL);

    if (!app.isPackaged) {
        win.webContents.openDevTools({ mode: 'detach' });
    }

    console.log("BBBB");
    require('./service');

    win.webContents.send('ping', 'whooooh!');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// app.on('activate', () => {
//     console.log("BBBB");
//     require('./service');
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });