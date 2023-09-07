const { join } = require("path");
const {ipcRenderer} = require("electron")
//makes valid path for all operating systems
function makePath() {
  return join(...arguments);
}

//checks is two audio objects are indentical
function areSameAudio(obj1, obj2) {

  if(!obj1 || !obj2) return false

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  for (const key of keys1) {
    //skip url and if keys2 doesnt include key or key values of two objects are not same then return false.
    if (key !== "url" && ( !keys2.includes(key) || obj1[key] !== obj2[key] ) ) return false;
  }

  return true;
}

//takes seconds and convert is to hh::mm::ss format.
function formatTime(seconds) {
  const date = new Date(0);
  date.setSeconds(seconds);
  //clips and return hh::mm::ss part of time string.
  return date.toISOString().substring(11, 19);
}

function escCharFilename(s){
  //escapes chars which is not allowed in dir or file names.
  return s.replace(/[\\/:"*?<>|]+/g, "")
}


//due to electron focus bug we need to call blur and focus methods to solve input cursor bug.
//BUG: https://github.com/electron/electron/issues/20400
async function makeAlert(msg) {
  alert(msg);
  await ipcRenderer.invoke("blur&focus");
}

module.exports = { makePath, formatTime, areSameAudio, escCharFilename, makeAlert};
