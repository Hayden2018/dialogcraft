const path = require('path');
const url = require('url');
const { app, BrowserWindow, Menu } = require('electron');
const { initialize, enable } = require('@electron/remote/main');

const { startListenForMessage } = require('./service');
const { template } = require('./menu');

initialize();

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
        icon: 'public/icon.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    win.loadURL(appURL);

    // For @electron/remote module
    enable(win.webContents);

    startListenForMessage(win);
}

app.on('ready', () => {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});