import { app, BrowserWindow, protocol, ipcMain, dialog } from "electron";
import { autoUpdater } from "electron-updater";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

autoUpdater.autoDownload = false;

autoUpdater.on("error", error => {
    dialog.showErrorBox("Error: ", error == null ? "unknown" : (error.stack || error).toString());
});

autoUpdater.on("update-available", () => {
    dialog.showMessageBox(
        {
            type: "info",
            title: "Found Updates",
            message: "Found updates, do you want update now?",
            buttons: ["No", "Yes"]
        },
        buttonIndex => {
            if (buttonIndex === 1) {
                autoUpdater.downloadUpdate();
            }
        }
    );
});

autoUpdater.on("update-downloaded", () => {
    dialog.showMessageBox(
        {
            title: "Install Updates",
            message: "Updates downloaded, quit the application to apply changes.",
            buttons: ["Later", "Restart"]
        },
        buttonIndex => {
            if (buttonIndex === 1) {
                setImmediate(() => autoUpdater.quitAndInstall());
            }
        }
    );
});

// export this to MenuItem click callback
app.on("ready", () => {
    autoUpdater.checkForUpdates();
});
