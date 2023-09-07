/*this module contains some functionalites for debugging purpose
only use this module when you debug application*/

require("dotenv").config();
const { Menu, webContents} = require("electron");

//logs messages in red color
function cwarn(text) {
  console.warn(`\x1b[31m${text}\x1b[0m`);
}

function checkDevMode() {
  const _ = process.env.DEV_MODE
  return _.toLowerCase();
}


/*Electron has weird bugs.we cannot zoom in/out.for debugging purpose
we use this function make this possible*/
function addZoomInOut() {
  const template = [
    {
      label: "View",
      submenu: [
        { role: "zoomin", accelerator: "CommandOrControl+=" },
        { role: "zoomOut" },
        {
          label: "Reset Zoom",
          accelerator: "CommandOrControl+0",
          click: () => {
            const focusedWebContents = webContents.getFocusedWebContents();
            if (focusedWebContents) {
              focusedWebContents.setZoomFactor(1); // Reset zoom to 100%
            }
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { addZoomInOut, cwarn, checkDevMode};
