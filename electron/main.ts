import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { exec } from 'node:child_process'
import * as ini from 'ini'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// Define a variable to store our INI configuration
let configData: any = {}

// Function to load the INI file
async function loadIniFile() {
  try {
    const iniPath = path.join(process.env.APP_ROOT as string, 'settings.ini')
    const fileContent = await fs.readFile(iniPath, 'utf-8')
    configData = ini.parse(fileContent)
    console.log('INI file loaded:', configData)
    return configData
  } catch (error) {
    console.error('Error loading INI file:', error)
    return {}
  }
}

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for folder operations
app.whenReady().then(async () => {
  // Load INI file when app starts
  await loadIniFile()
  
  // IPC handler to get config data
  ipcMain.handle('get-config-data', () => {
    return configData
  })
  
  // Open folder dialog
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0]
  })

  // Get folder contents
  ipcMain.handle('get-folder-contents', async (_, folderPath) => {
    try {
      const items = await fs.readdir(folderPath, { withFileTypes: true })
      const contents = await Promise.all(items.map(async (item) => {
        const fullPath = path.join(folderPath, item.name)
        return {
          name: item.name,
          isDirectory: item.isDirectory(),
          path: fullPath
        }
      }))
      return contents
    } catch (error) {
      console.error('Error reading directory:', error)
      return []
    }
  })

  // Open Notepad
  ipcMain.handle('open-notepad', async (_, filePath = null) => {
    try {
      let command = 'notepad.exe'
      if (filePath) {
        command += ` "${filePath}"`
      }
      
      exec(command, (error) => {
        if (error) {
          console.error('Error opening Notepad:', error)
          return false
        }
      })
      return true
    } catch (error) {
      console.error('Error opening Notepad:', error)
      return false
    }
  })

  createWindow()
})
