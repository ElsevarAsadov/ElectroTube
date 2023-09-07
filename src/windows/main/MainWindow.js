const Window = require("../Window");

class MainWindow extends Window {
  constructor(options, htmlPath) {
    super(options, htmlPath);
  }

  /**
   *
   * @param options {Object}
   * @param htmlPath {String}
   * @returns {MainWindow}
   * this class is follows Singleton design pattern
   * class will have only one copy of in RAM and others instances can only refers it.
   */
  static getInstance(options, htmlPath) {
    if (!this.__instance) {
      this.__instance = new this(options, htmlPath);
    }
    return this.__instance;
  }
}

module.exports = MainWindow;
