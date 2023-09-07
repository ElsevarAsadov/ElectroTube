//const debug = require("electron-debug");
const Store = require("electron-store");
const os = require("os");
const { dialog } = require("electron");
// const {
//   cwarn,
//   addZoomInOut,
//   checkDevMode,
// } = require("./src/utils/debuggingFunctionalities");
const { makePath } = require("./src/utils/helperFunctionalites");
const MainWindow = require("./src/windows/main/MainWindow");
const SettingsWindow = require("./src/windows/settings/SettingsWindow");

/*if application is in development mode
then runs electron reloader for hot-reloading functionality*/
// if (checkDevMode() === "development") {
//   try {
//     //showDevTools means initially do not open devtools.to open manually
//     // you should use F12
//     debug({ showDevTools: false });
//
//     cwarn("APPLICATION DEVELOPMENT MODE ENABLED!!!");
//
//     require("electron-reloader")(module);
//     addZoomInOut();
//   } catch {}
// }

const mainWindow = MainWindow.getInstance(
  {
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  },
  makePath(__dirname, "src", "windows", "main", "main.html"),
);

//if user has option value in storage or has no value for specific option then
//the corresponding option in this dict will be considered.
const defaultOptions = {
  location: os.homedir(),
  quality: "Highest Quality",
  windowStyle: "Standard",
};

async function main() {
  const store = new Store();

  //if there is no location option in storage then use default one.
  if (store.get("location") === undefined) {
    store.set("location", defaultOptions.location);
  }
  //if there is no quality option in storage then use default one.
  if (store.get("quality") === undefined) {
    store.set("quality", defaultOptions.quality);
  }
  //if there is no window style option in storage then use default one.
  if (store.get("windowStyle") === undefined) {
    store.set("windowStyle", defaultOptions.windowStyle);
  }

  await mainWindow.create();
  mainWindow.show();

  const settingsWindow = SettingsWindow.getInstance(
    {
      width: 300,
      height: 300,
      resizable: false,
      parent: mainWindow.win,
      maximizable: false,
      minimizable: false,
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    },
    makePath(__dirname, "src", "windows", "settings", "settings.html"),
  )
    .registerIPCEvent("dialog:open:settings", async () => {
      const t = await dialog.showOpenDialog(settingsWindow.win, {
        properties: ["openDirectory"],
      });
      //if user doesnt cancel window then set new location value in storage
      if (!t.canceled) {
        store.set("location", t.filePaths[0]);
        //send msg to renderer option is changed to update menu.
        settingsWindow.win.webContents.send("update-menu");
      }
    })
    .registerIPCEvent("style:setAlwaysOnTop:window", () => {
      mainWindow.win.setAlwaysOnTop(true);
    })
    .registerIPCEvent("style:setStandard:window", () => {
      mainWindow.win.setAlwaysOnTop(false);
    });

  mainWindow
    .registerIPCEvent("open-settings-window", async () => {
      /*if settings window is already opened and settings icon is clicked
      then destroy window.*/
      if (settingsWindow.isActive) {
        settingsWindow.destroy();
        return;
      }
      //other wise create new window.
      await settingsWindow.create();
      settingsWindow.show();
    })
    .registerIPCEvent("blur&focus", () => {
      mainWindow.win.blur();
      mainWindow.win.focus();
    })
    //empty menu
    .setMenu([]);
}

main();
