module.exports = {
  packagerConfig: {
    asar: true,
    icon: "icon",
  },
  rebuildConfig: {},
  makers: [
    // {
    //   name: '@electron-forge/maker-squirrel',
    //   config: {},
    // },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
    {
      name: '@electron-forge/maker-wix',
      config: {
        ui: {
          "chooseDirectory": true,
        },
        language: 1033,
        manufacturer: 'Github Elsevar Asadov',
        exe: "ElectroTube",
        name: "ElectroTube",
        version: "1.0.0",
        icon: "icon.ico"
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
