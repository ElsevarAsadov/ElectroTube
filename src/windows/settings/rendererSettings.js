const Store = require("electron-store");
const { ipcRenderer } = require("electron");

const changeLocationBtn = document.getElementById("change-location-btn");
const currentLocation = document.getElementById("current-location");
const qualitySelection = document.getElementById("quality-selection");
const windowStyleSelection = document.getElementById("window-style-selection");

const store = new Store();

function refreshOptions() {
  currentLocation.innerText = store.get("location");
  currentLocation.setAttribute("title", store.get("location"));
  qualitySelection.value = store.get("quality");
  windowStyleSelection.value = store.get("windowStyle");
}
document.addEventListener("DOMContentLoaded", async () => {
  refreshOptions();
  if (store.get('windowStyle') !== "Standard") {
    return await ipcRenderer.invoke("style:setAlwaysOnTop:window");
  }
  await ipcRenderer.invoke("style:setStandard:window");
});

changeLocationBtn.addEventListener("click", async () => {
  const Settings = require("./SettingsWindow");
  const settings = new Settings();
  console.log(settings);
  await ipcRenderer.invoke("dialog:open:settings");
});

qualitySelection.addEventListener("change", function () {
  store.set("quality", this.value);
});
//changes window style.if it is standart then windows behaves as OS standards
//but if it is Always On Top then it means window always will be on top of
// other windows basically window will be always visible to user
windowStyleSelection.addEventListener("change", async function () {
  store.set("windowStyle", this.value);
  if (this.value !== "Standard") {
    return await ipcRenderer.invoke("style:setAlwaysOnTop:window");
  }
  await ipcRenderer.invoke("style:setStandard:window");
});

//when one of options change then update menu.
ipcRenderer.on("update-menu", () => {
  refreshOptions();
});
