import { app, BrowserWindow, ipcMain } from 'electron'
import ipc from './ipc/index.js'

const { DEV } = process.env

app.whenReady().then(() => {
  const win = new BrowserWindow({
    frame: true,
    autoHideMenuBar: true,

    backgroundColor: '#242932',
    icon: 'src/electron/icon.png',

    width: 2048,
    height: 800,

    webPreferences: {
      devTools: DEV,
      preload: app.getAppPath() + '/src/electron/ipc/preload.js',
      nodeIntegration: true
    }
  })

  win.webContents
    .executeJavaScript('({...localStorage});', true)
    .then((localStorage) => {
      console.log(localStorage)
    })

  ipc(ipcMain, app, win)

  if (DEV) {
    win.loadURL('http://localhost:3000')
    win.openDevTools()
  } else {
    win.loadFile('src/web/index.html')
  }
})

app.on('window-all-closed', () => app.quit())
