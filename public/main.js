require('dotenv').config();
const path = require('path');
const url = require('url');

const { app, BrowserWindow } = require('electron');
const { startListenForMessage } = require('./service');

function createWindow() {

    const appURL = app.isPackaged ? url.format({
        pathname: path.join(__dirname, '../build/index.html'),
        protocol: "file:",
        slashes: true,
    }) : 'http://localhost:3000';

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 960,
        minHeight: 640,
        icon: 'icon32.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadURL(appURL);

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