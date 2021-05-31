const { app, BrowserWindow, Menu, shell, nativeTheme } = require('electron')
const fs = require('fs');

const appName = 'Apple Music'

if (process.env.SNAP_USER_COMMON) {
  localeFile = process.env.SNAP_USER_COMMON + '/locale';
  if (!fs.existsSync(localeFile)) {
    fs.writeFileSync(localeFile, app.getLocaleCountryCode());
  }
  locale = fs.readFileSync(localeFile).toString().substring(0, 2).toUpperCase();

  themeFile = process.env.SNAP_USER_COMMON + '/theme';
  if (!fs.existsSync(themeFile)) {
    fs.writeFileSync(themeFile, 'light');
  }
  nativeTheme.themeSource = fs.readFileSync(themeFile).toString().toLowerCase();
}
else {
  locale = app.getLocaleCountryCode();
  themeFile = null;
  nativeTheme.themeSource = 'light';
}

const appUrl = 'https://music.apple.com/'

const customCss =
  '.web-navigation__native-upsell {display: none !important;}'

function createWindow() {
  Menu.setApplicationMenu(null)

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: appName
  })
  mainWindow.loadURL(appUrl + locale.toLowerCase() + '/browse')

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyUp' && input.control && input.key.toLowerCase() === 'r') {
      mainWindow.reload();
    }
    else if (input.type === 'keyUp' && input.control && input.key.toLowerCase() === 'd') {
      if (nativeTheme.themeSource === 'light') {
        nativeTheme.themeSource = 'dark'
      }
      else {
        nativeTheme.themeSource = 'light'
      }
      if (themeFile) {
        fs.writeFileSync(themeFile, nativeTheme.themeSource);
      }
    }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(appUrl)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  });

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault()
    shell.openExternal(url)
  });

  mainWindow.webContents.on('did-navigate', () => {
    mainWindow.webContents.insertCSS(customCss)
  });

  mainWindow.webContents.on('page-title-updated', () => {
    mainWindow.webContents.insertCSS(customCss)
    mainWindow.setTitle(appName);
  });

  mainWindow.on("close", () => {
    app.exit(0);
 });
}

app.on('widevine-ready', () => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})