module.exports = {
  appId: 'com.ohrigina.stage-timer-pro',
  productName: 'Stage Timer Pro',
  directories: {
    output: 'release'
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  extraResources: [
    {
      from: 'electron/assets',
      to: 'assets'
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'electron/assets/icon.png',
    publisherName: 'Ohrigina LLC',
    verifyUpdateCodeSignature: false
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Stage Timer Pro',
    installerIcon: 'electron/assets/icon.png',
    uninstallerIcon: 'electron/assets/icon.png',
    installerHeaderIcon: 'electron/assets/icon.png',
    license: 'LICENSE.txt'
  },
  portable: {
    artifactName: 'StageTimerPro-Portable.exe'
  }
};