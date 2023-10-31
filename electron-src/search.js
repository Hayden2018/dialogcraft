const { ipcMain, BrowserWindow } = require('electron');


function handleSearchRequest(window) {

    const searchWindow = new BrowserWindow({
        height: 50,
        width: 400,
        parent: window,
        show: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    searchWindow.on('close', (event) => {
        event.preventDefault();
        searchWindow.hide();
    });

    searchWindow.loadFile('public/search.html');

    window.on('move', () => {
        const { x, y, width } = window.getBounds();
        const newX = Math.round(x + width / 2 - 200);
        const newY = Math.round(y + 60);
        searchWindow.setPosition(newX, newY);
    });

    window.on('resize', () => {
        const { x, y, width } = window.getBounds();
        const newX = Math.round(x + width / 2 - 200);
        const newY = Math.round(y + 60);
        searchWindow.setPosition(newX, newY);
    });

    ipcMain.on('START-SEARCH', (event, data) => {
        const { x, y, width } = window.getBounds();
        const newX = Math.round(x + width / 2 - 200);
        const newY = Math.round(y + 60);
        searchWindow.setPosition(newX, newY);
        searchWindow.show();
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
        searchWindow.webContents.executeJavaScript('searchInput.value = ""');
        window.webContents.stopFindInPage('clearSelection');
        searchWindow.hide();
        window.focus();
    });
}

module.exports = {
    handleSearchRequest,
}
