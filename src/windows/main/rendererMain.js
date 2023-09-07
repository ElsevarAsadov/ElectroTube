const AudioDownloader = require("./../../AudioDownloader");
const Store = require("electron-store")
const { ipcRenderer } = require("electron");
const { areSameAudio, makeAlert} = require("../../utils/helperFunctionalites");


const store = new Store()

const settingsBtn = document.getElementById("settings-icon");
const downloadBtn = document.getElementById("download-icon");
const urlInput = document.getElementById("url-input");
const groupItemsContainer = document.getElementById("group-items-container");
const addToGroupBtn = document.getElementById("add-to-group-icon");
const downloadGroup = document.getElementById("download-group-btn");

// HTML template for group items
const groupItemTemplate = `
  <div class="group-item-container">
    <i class="group-item-delete-icon fa-solid fa-xmark"></i>
    <div class="group-item-text-container">
      <div class="group-item-text">Name: <span class="group-item-text-inner">%NAME%</span></div>
      <div class="group-item-text">Duration: <span class="group-item-text-inner">%DURATION%</span></div>
    </div>
    <i class="group-item-music-icon fa-solid fa-music "></i>
  </div>
`;

let audios = [];
let validUrl = false;
let audioInfo;
let audioUrl;

let isSingleDownloading = false;
let isGroupDownloading = false;

//reset states and input value
function reset() {
  urlInput.value = "";
  audioInfo = null;
  validUrl = false;
}

//toggles 'add' and 'loading' icons.
function toggleIcon() {
  addToGroupBtn.classList.toggle("fa-spin");
  addToGroupBtn.classList.toggle("fa-spinner");
}


//adds audio group item into DOM and audios list.
function addAudioToGroup(name, duration) {
  //creating group item
  const groupItemHTML = groupItemTemplate
    .replace("%NAME%", name)
    .replace("%DURATION%", duration);
  groupItemsContainer.insertAdjacentHTML("afterbegin", groupItemHTML);
  document
    .querySelector(".group-item-delete-icon")
    .addEventListener("click", function () {
      //removes group item from DOM
      this.parentNode.remove();
      //removes group item from list
      audios = audios.filter((audio) => {
        return !(audio.name === name && audio.duration === duration);
      });
    });
}

//whenever any item changed in audio we should call this function to update DOM
function insertItems() {
  //removes all previous items from DOM
  while (groupItemsContainer.firstChild) {
    groupItemsContainer.removeChild(groupItemsContainer.firstChild);
  }
  //adding item to group
  audios.push({ ...audioInfo, url: audioUrl });

  //inserts again all audios
  for (const audio of audios) {
    addAudioToGroup(audio.name, audio.duration);
  }

  //reset();
}

async function validate(value) {
  //whenever user input something reset every information
  audioUrl = value;
  validUrl = false;
  //checks url is valid yt url but this doesnt mean that there is video or not.
  if (AudioDownloader.validateUrl(audioUrl)) {
    validUrl = true;
    toggleIcon();
    /* returns false it there is no video associated with the url.
    when promise is not resolved audioInfo is null*/
    audioInfo = await AudioDownloader.getAudioInfo(audioUrl);
    toggleIcon();
  }
}

//if settings icon is clicked then trigger window event.
settingsBtn.addEventListener("click", () => {
  ipcRenderer.invoke("open-settings-window");
});

urlInput.addEventListener("input", async ({ target }) => {
  //every time user insert something input recheck validation
  await validate(target.value);
});
addToGroupBtn.addEventListener("click", async () => {
  //if this audio is already in group return
  if (audioInfo && audios.find((audio) => areSameAudio(audio, audioInfo))) {
    await makeAlert("This Audio Is Already In Group!");
  }
  //if url is not valid youtube url or url is valid but there is no audio associated with the url
  else if (!validUrl || audioInfo === false) {
    await makeAlert("Video Url Is Invalid Or There Is No Internet Connection.");
  }
  //if url is valid and there is video associated with the url.
  else if (validUrl && audioInfo) {
    insertItems();
  }
});

//when user wants to download current url only.
downloadBtn.addEventListener("click", async () => {
  //if downloading already started then do not download again
  if (isSingleDownloading)
    return await makeAlert("Downloading Already Started");
  if (!validUrl || !audioInfo) {
    return makeAlert("There Is No Valid Audio To Download");
  }

  isSingleDownloading = true;
  toggleIcon();
  const audio = new AudioDownloader(audioUrl, store.get('quality'));
  try {
    await audio.download(audioInfo.name, store.get('location'));
  } catch (err) {
    //if some error happen when downloading audio.
    return await makeAlert(
      `Error Happened When Downloading "${audioInfo.name}" Error: ${err}`,
    );
  } finally {
    isSingleDownloading = false;
    toggleIcon();
  }
  await makeAlert("Audio Successfully Downloaded");
});

//when user wants to download entire group.
downloadGroup.addEventListener("click", async () => {
  if (audios.length === 0)
    return makeAlert("There Is No Group Item To Download");
  //if already downloading process started then do not download again.
  if (isGroupDownloading) return await makeAlert("Downloading Already Started");

  isGroupDownloading = true;
  toggleIcon();

  const downloadPromises = [];

  audios.forEach((audio) => {
    const t = new AudioDownloader(audio.url, store.get('quality'));
    const downloadPromise = t.download(audio.name, store.get('location'));

    // Add the download promise to the array
    downloadPromises.push(downloadPromise);
  });

  // Wait for all download promises to resolve
  try {
    await Promise.allSettled(downloadPromises);
    // You can proceed with further actions here
  } catch (error) {
    await makeAlert(error);
  } finally {
    isGroupDownloading = false;
    toggleIcon();
  }
  await makeAlert("All downloads completed successfully.");
});
