const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', () => {

    // Create window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    });

    // Load a html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    })); 0

    //Quit app when closed
    mainWindow.on('closed', () => {
        app.quit();
    })

    // Build main menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // Insert the menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window 
function createAddWindow() {
    // Create add window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item'
    });

    // Load a html file into add window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addItems.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('close', () => {
        addWindow = null;
    })
}

// Catch item add
ipcMain.on('item:add', (e, item) => {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Remove all Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command + Q' : 'Ctrl + Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
};

// Add a developer tools item if not in production
if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Devtools',
                accelerator: process.platform == 'darwin' ? 'Command + I' : 'Ctrl + I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}