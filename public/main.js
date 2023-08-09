require('dotenv').config();
const path = require('path');
const url = require('url');

const { app, BrowserWindow } = require('electron');
const { startListenForMessage } = require('./service');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1080,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
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

    startListenForMessage(win);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});