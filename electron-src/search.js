const { ipcMain, BrowserWindow } = require('electron');


function handleSearchRequest(window) {

    const searchWindow = new BrowserWindow({
        height: 40,
        width: 400,
        parent: window,
        show: false,
        frame: false,
        resizable: false,
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

    let maximized = window.isMaximized();

    window.on('move', () => {
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 7);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 10;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    window.on('resize', () => {
        console.log(maximized)
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 7);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 10;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    window.on('maximize', () => {
        maximized = true;
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + 9);
        const searchX = Math.round(x + (width - searchWidth) / 2) - 10;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
    });

    window.on('unmaximize', () => {
        maximized = false;
    });

    ipcMain.on('START-SEARCH', (event, data) => {
        const { x, y, width } = window.getBounds();
        const searchWidth = Math.min(width - 290, 380);
        const searchY = Math.round(y + (maximized ? 9 : 7));
        const searchX = Math.round(x + (width - searchWidth) / 2) - 10;
        searchWindow.setBounds({
            x: searchX,
            y: searchY,
            width: searchWidth,
            height: 40,
        });
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
