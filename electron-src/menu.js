const { shell, BrowserWindow } = require('electron');

let aboutWindow = null;

function createAboutWindow () {
    if (aboutWindow === null) {
        aboutWindow = new BrowserWindow({
            width: 480,
            height: 360,
            resizable: false,
            icon: 'public/icon.ico',
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
      
        aboutWindow.loadFile('public/about.html');
        aboutWindow.on('closed', () => {
            aboutWindow = null;
        });
    } else {
        aboutWindow.focus();
    }
}

exports.template = [
    {
        label: 'Edit',
        submenu: [
            {
                label: 'Undo',
                accelerator: 'CmdOrCtrl+Z',
                role: 'undo'
            },
            {
                label: 'Redo',
                accelerator: 'Shift+CmdOrCtrl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut'
            },
            {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy'
            },
            {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste'
            },
            {
                label: 'Delete',
                accelerator: 'CmdOrCtrl+V',
                role: 'delete'
            },
        ]
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                role: 'reload'
            },
            {
                label: 'Force Reload',
                accelerator: 'Shift+CmdOrCtrl+R',
                role: 'forceReload'
            },
            {
                label: 'Toggle Developer Tool',
                accelerator: 'F12',
                role: 'toggleDevTools',
                visible: false
            },
            {
                type: 'separator'
            },
            {
                label: 'Actual Size',
                accelerator: 'CmdOrCtrl+0',
                role: 'resetZoom'
            },
            {
                label: 'Zoom In',
                accelerator: 'CmdOrCtrl+=',
                role: 'zoomIn'
            },
            {
                label: 'Zoom Out',
                accelerator: 'CmdOrCtrl+-',
                role: 'zoomOut'
            },
        ]
    },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Contact Author',
                click: function() { shell.openExternal('mailto:yikhei123@gmail.com') }
            },
            {
                label: 'View on Github',
                click: function() { shell.openExternal('https://github.com') }
            },
            {
                label: 'About',
                click: createAboutWindow,
            },
        ]
    },
];