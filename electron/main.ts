import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { exec, spawn } from 'node:child_process'
import * as ini from 'ini'
import { tmpdir } from 'os'
import { v4 as uuidv4 } from 'uuid'

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

// Track application start time
const appStartTime = Date.now()

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
    width: 1600,
    height: 900,
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
// Helper function to execute a Python script and return its output
async function executePythonScript(scriptPath: string) {
  return new Promise<{ success: boolean; output: string; error: string }>(resolve => {
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3'
    const pythonProcess = spawn(pythonCommand, [scriptPath])
    
    let stdoutData = ''
    let stderrData = ''
    
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })
    
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString()
    })
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output: stdoutData,
          error: ''
        })
      } else {
        resolve({
          success: false,
          output: stdoutData,
          error: stderrData || `Process exited with code ${code}`
        })
      }
    })
    
    pythonProcess.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message
      })
    })
  })
}

// Helper function to execute an executable file and return its output
async function executeExeFile(exePath: string, args: string[] = []) {
  return new Promise<{ success: boolean; output: string; error: string }>(resolve => {
    // Make sure it's a valid executable
    if (!exePath.toLowerCase().endsWith('.exe')) {
      resolve({
        success: false,
        output: '',
        error: 'Invalid executable file. Must be an .exe file.'
      })
      return
    }
    
    // Execute the program
    const process = spawn(exePath, args)
    
    let stdoutData = ''
    let stderrData = ''
    
    process.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })
    
    process.stderr.on('data', (data) => {
      stderrData += data.toString()
    })
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve({
          success: true,
          output: stdoutData,
          error: ''
        })
      } else {
        resolve({
          success: false,
          output: stdoutData,
          error: stderrData || `Process exited with code ${code}`
        })
      }
    })
    
    process.on('error', (error) => {
      resolve({
        success: false,
        output: '',
        error: error.message
      })
    })
  })
}

// Promise wrapper for exec
function execPromise(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      resolve({ stdout, stderr })
    })
  })
}

app.whenReady().then(async () => {
  // Load INI file when app starts
  await loadIniFile()
  
  // IPC handler to get config data
  ipcMain.handle('get-config-data', () => {
    return configData
  })
  
  // IPC handler to get execution time
  ipcMain.handle('get-execution-time', () => {
    const currentTime = Date.now()
    const executionTimeMs = currentTime - appStartTime
    return executionTimeMs
  })
  
  // IPC handler to run Python code from input
  ipcMain.handle('run-python-code', async (_, code: string) => {
    try {
      // Create a temporary file with the Python code
      const tempFilePath = path.join(tmpdir(), `electron_python_${uuidv4()}.py`)
      await fs.writeFile(tempFilePath, code, 'utf8')
      
      // Execute the Python script
      return await executePythonScript(tempFilePath)
    } catch (error) {
      console.error('Error running Python code:', error)
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
  
  // IPC handler to run Python file
  ipcMain.handle('run-python-file', async (_, filePath: string) => {
    try {
      // Check if file exists and has .py extension
      const stats = await fs.stat(filePath)
      if (!stats.isFile() || !filePath.toLowerCase().endsWith('.py')) {
        throw new Error('Invalid Python file')
      }
      
      // Execute the Python script
      return await executePythonScript(filePath)
    } catch (error) {
      console.error('Error running Python file:', error)
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
  
  // IPC handler to run an executable file
  ipcMain.handle('run-exe-file', async (_, filePath: string, args: string[] = []) => {
    try {
      // Check if file exists and has .exe extension
      const stats = await fs.stat(filePath)
      if (!stats.isFile() || !filePath.toLowerCase().endsWith('.exe')) {
        throw new Error('Invalid executable file')
      }
      
      // Execute the file
      return await executeExeFile(filePath, args)
    } catch (error) {
      console.error('Error running executable file:', error)
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
  
  // IPC handler to run executable from command line input
  ipcMain.handle('run-exe-command', async (_, command: string) => {
    try {
      // Create a temporary batch file with the command
      const tempFilePath = path.join(tmpdir(), `electron_command_${uuidv4()}.bat`)
      await fs.writeFile(tempFilePath, command, 'utf8')
      
      // Run the batch file
      const result = await new Promise<{ success: boolean; output: string; error: string }>(resolve => {
        const process = spawn('cmd.exe', ['/c', tempFilePath])
        
        let stdoutData = ''
        let stderrData = ''
        
        process.stdout.on('data', (data) => {
          stdoutData += data.toString()
        })
        
        process.stderr.on('data', (data) => {
          stderrData += data.toString()
        })
        
        process.on('close', (code) => {
          // Clean up temp file
          fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err))
          
          if (code === 0) {
            resolve({
              success: true,
              output: stdoutData,
              error: ''
            })
          } else {
            resolve({
              success: false,
              output: stdoutData,
              error: stderrData || `Process exited with code ${code}`
            })
          }
        })
        
        process.on('error', (error) => {
          // Clean up temp file
          fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err))
          
          resolve({
            success: false,
            output: '',
            error: error.message
          })
        })
      })
      
      return result
    } catch (error) {
      console.error('Error running command:', error)
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })
  
  // IPC handler to check if Python is installed
  ipcMain.handle('check-python-installed', async () => {
    try {
      const command = process.platform === 'win32' ? 'python --version' : 'python3 --version'
      const { stdout } = await execPromise(command)
      return {
        installed: true,
        version: stdout.trim()
      }
    } catch (error) {
      console.error('Python not found:', error)
      return {
        installed: false,
        version: ''
      }
    }
  })
  
  // Open folder dialog
  ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0]
  })
  
  // Open file dialog
  ipcMain.handle('open-file-dialog', async (_, options: { filters?: { name: string, extensions: string[] }[] }) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: options.filters || []
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
