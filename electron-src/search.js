const { ipcMain, BrowserWindow } = require('electron');
const os = require('os');

function handleSearchRequest(window) {

    let searchWindow = null;
    let topMargin = 20;
    if (os.platform() === 'linux') {
        topMargin = 8;
    }

    window.on('move', () => {
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 300, 400);
        const searchY = Math.round(y + topMargin);
        const searchX = Math.round(x + (width - searchWidth) / 2);
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    window.on('resize', () => {
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 300, 400);
        const searchY = Math.round(y + topMargin);
        const searchX = Math.round(x + (width - searchWidth) / 2);
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    ipcMain.on('START-SEARCH', () => {
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 300, 400);
        const searchY = Math.round(y + topMargin);
        const searchX = Math.round(x + (width - searchWidth) / 2);
        searchWindow = new BrowserWindow({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
            parent: window,
            show: true,
            frame: false,
            resizable: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            }
        });
    
        searchWindow.loadFile('electron-src/search.html');
        searchWindow.webContents.executeJavaScript('searchInput.focus()');
    });

    ipcMain.on('SEARCH', (event, data) => {
        if (data) window.webContents.findInPage(data);
        else window.webContents.stopFindInPage('clearSelection');
    });

    ipcMain.on('SEARCH-BACK', (event, data) => {
        if (data) window.webContents.findInPage(data, {
            findNext: true,
            forward: false,
        });
    });

    ipcMain.on('SEARCH-NEXT', (event, data) => {
        if (data) window.webContents.findInPage(data, {
            findNext: true,
            forward: true,
        });
    });

    ipcMain.on('CLOSE-SEARCH', () => {
        searchWindow.destroy();
        searchWindow = null;
        window.webContents.stopFindInPage('clearSelection');
        window.focus();
    });
}

module.exports = {
    handleSearchRequest,
}
