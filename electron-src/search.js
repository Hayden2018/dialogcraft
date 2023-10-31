const { ipcMain, BrowserWindow } = require('electron');


function handleSearchRequest(window) {

    let searchWindow = null;
    let maximized = window.isMaximized();

    window.on('move', () => {
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 7);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 5;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 38,
        });
    });

    window.on('resize', () => {
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 7);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 5;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 38,
        });
    });

    window.on('maximize', () => {
        maximized = true;
        if (!searchWindow) return;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 10);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 5;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 38,
        });
    });

    window.on('unmaximize', () => {
        maximized = false;
    });

    ipcMain.on('START-SEARCH', (event, data) => {
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + (maximized ? 10 : 7));
        const searchX = Math.round(x + (width - searchWidth) / 2) - 5;
        searchWindow = new BrowserWindow({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 38,
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
        searchWindow.focus();
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
