const { app, BrowserWindow, Menu } = require('electron');

// Prevent showing app content during windows setup
if (require('electron-squirrel-startup')) app.quit();

let mainWindow = null;

// Only one instance run at any given time
if (app.requestSingleInstanceLock()) {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
} else {
    app.quit();
}

const path = require('path');
const url = require('url');
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

    mainWindow = new BrowserWindow({
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

    mainWindow.loadURL(appURL);

    // For @electron/remote module
    enable(mainWindow.webContents);

    startListenForMessage(mainWindow);
}

app.on('ready', () => {
    console.log(`Runnig at ${app.getVersion()}`) 
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});