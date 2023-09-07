const { app, BrowserWindow, ipcMain, Menu } = require("electron");

class Window {
  constructor(options, htmlPath) {
    this._options = options;
    this._htmlPath = htmlPath;
    //represents if window is visible or not.
    this.isActive = false;
    //represents if window is destroyed or not.
    this.isCreated = false;
    //renderer process will send a message and user registers callback functions for this messages.
    this.IPCevents = {};
    //when app is ready to show window will be available
    this.win = null;
  }

  async create() {
    this.isCreated = true;
    await app.whenReady();
    //show always should be false
    this.win = new BrowserWindow({ ...this._options, show: false });
    //loads html to window
    this.win.loadFile(this._htmlPath);
    //deletes all ipc events if there is.
    this.removeIPCEvents('*')
    //runs registered IPC events when renderer messages to main
    await this.handleIPCEvents();

    //when window is closed manually then reset properties
    this.win.on("closed", () => {
      this.isCreated = false;
      this.isActive = false;
    });

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.create();
      }
    });
  }

  setMenu(template) {
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    return this;
  }

  //handles ipc events which comes from renderer process using ipcRenderer.invoke(name)
  async handleIPCEvents() {
    for (const [name, callback] of Object.entries(this.IPCevents)) {
      ipcMain.handle(name, callback);
    }
  }

  //removes event handler(s).one message can have only 1 callback function.
  //whenever user registers new one then program removes all handlers and register again all.
  removeIPCEvents(name) {
    switch (name) {
      case "*":
        for (const name of Object.keys(this.IPCevents)) {
          ipcMain.removeHandler(name);
        }
        break;
      default:
        ipcMain.removeHandler(name);
    }
  }

  //registers events for application
  registerIPCEvent(name, callback) {
    this.IPCevents[name] = callback;
    this.removeIPCEvents("*");
    this.handleIPCEvents();

    return this;
  }

  show() {
    if (this.isActive) return;
    this.isActive = true;
    this.win.once("ready-to-show", this.win.show);
  }

  hide() {
    if (!this.isActive) return;
    this.isActive = false;
    this.win.hide();
  }

  destroy() {
    if (!this.isCreated) return;
    this.isActive = false;
    this.isCreated = false;
    this.win.destroy();
  }
}

module.exports = Window;
