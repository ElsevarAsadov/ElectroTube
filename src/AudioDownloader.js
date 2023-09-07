const fs = require("fs");
const ytdl = require("ytdl-core");
const {
  makePath,
  formatTime,
  makeAlert,
  escCharFilename,
} = require("./utils/helperFunctionalites");
//this class provides some functionalities for download audio from youtube
class AudioDownloader {
  optionsMap = {
    "Highest Quality": "highest",
    "Lowest Quality": "lowest",
  };
  constructor(url, quality) {
    this.url = url;
    this.quality = this.optionsMap[quality];
    //represents audio progress when downloading. value is in range [0, 100] ->100 means downloaded fully.
    this.progress = 0;
  }

  //checks if url is valid youtube url
  static validateUrl(url) {
    return (
      /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/.test(url) ||
      /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.be)\/.+$/.test(url)
    );
  }

  static async getAudioInfo(url) {
    try {
      const {
        videoDetails: { lengthSeconds, title },
      } = await ytdl.getInfo(url);
      return { duration: formatTime(+lengthSeconds), name: title };
    } catch {
      return false;
    }
  }

  download(name, path) {
    return new Promise((resolve, reject) => {
      let isErrorHappen = false;
      //normalize method escapes some chars which is not suitable for file name.
      const filePath = makePath(path ?? "", escCharFilename(name + ".mp3"));
      const stream = ytdl(this.url, {
        filter: "audioonly",
        quality: this.quality,
      })
        .on("finish", () => {
          resolve();
        })
        .on("error", (error) => {
          isErrorHappen = true;
          //when ever error happen we need to end stream because as long as stream is active
          //OS doesnt let you delete file.
          makeAlert(`Error Happenend When Downloading: ${name}`);
          stream.end();
          reject(error);
        })
        .on("end", () => {
          if (isErrorHappen) fs.unlinkSync(filePath);
        })
        .on("progress", (length, downloaded, totalLength) => {
          this.progress = (downloaded / totalLength) * 100;
        });
      stream.pipe(fs.createWriteStream(filePath));
    });
  }
}
module.exports = AudioDownloader;
