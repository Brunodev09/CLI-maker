import { App, BrowserWindow, ipcMain, app } from "electron";
import fs from "fs";

export default class Window {
    private app: App;
    private __w: BrowserWindow;
    private width: number;
    private height: number;
    constructor(width: number, height: number) {
        this.app = app;
        this.__w;
        this.width = width;
        this.height = height;

        this.listen();
    }

    private createWindow = () => {
        const pathString = "./views/entry.html";
        this.__w = new BrowserWindow({
            width: this.width,
            height: this.height,
            resizable: false,
            // frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        this.__w.loadFile(pathString);
        this.__w.removeMenu();

        this.__w.on('closed', () => {
            this.__w = null
        });
    }

    private listen() {
        this.app.on('ready', this.createWindow);

        this.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.app.quit();
            }
        });

        this.app.on('activate', () => {
            if (this.__w === null) {
                this.createWindow();
            }
        });

        ipcMain.on('log', (event, arg) => {
            console.log('[WEB_PAGE] - ', arg);
            // event.returnValue = 'pong';
        });


        ipcMain.on('resize', (event, dimension) => {
            console.log('[MAIN] ', `Resizing window to dimensions ${JSON.stringify(dimension)}...`);
            this.__w.setSize(dimension.width, dimension.height)
        });


        ipcMain.on('error', (event, error) => {
            console.log('[ERROR - WEB PAGE] ', error);
        });

    }
}