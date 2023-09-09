module.exports = {
  packagerConfig: {
    icon: 'public/icon',
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'DialogCraft',
        certificateFile: './certificate.pfx',
        certificatePassword: process.env.CERT_KEY,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        name: 'DialogCraft',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        name: 'DialogCraft',
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
