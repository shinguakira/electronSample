import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Register all dialog-related IPC handlers
 */
export function registerDialogHandlers(mainWindow: BrowserWindow) {
  // Open folder dialog
  ipcMain.handle('open-folder-dialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })

  // Open file dialog
  ipcMain.handle('open-file-dialog', async (_, options = {}) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: options.filters || []
    })
    if (canceled) {
      return null
    } else {
      return filePaths[0]
    }
  })
  
  // Get folder contents
  ipcMain.handle('get-folder-contents', async (_, folderPath: string) => {
    try {
      const files = await fs.readdir(folderPath)
      const contents = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file)
          const stats = await fs.stat(filePath)
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          }
        })
      )
      return contents
    } catch (error) {
      console.error('Error getting folder contents:', error)
      return []
    }
  })
}
