const { ipcMain, BrowserWindow } = require('electron');

function handleSearchRequest(window) {

    let searchWindow = null;

    window.on('move', () => {
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 300, 400);
        const searchY = Math.round(y + 20);
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
        const searchY = Math.round(y + 20);
        const searchX = Math.round(x + (width - searchWidth) / 2);
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    ipcMain.on('START-SEARCH', (event, data) => {
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 300, 400);
        const searchY = Math.round(y + 20);
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
    
        searchWindow.loadFile('public/search.html');
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

    ipcMain.on('CLOSE-SEARCH', (event, data) => {
        searchWindow.destroy();
        searchWindow = null;
        window.webContents.stopFindInPage('clearSelection');
        window.focus();
    });
}

module.exports = {
    handleSearchRequest,
}
