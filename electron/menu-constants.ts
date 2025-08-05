import { app, shell, BrowserWindow, dialog } from 'electron'
import { logger } from './main' // We'll need to export the logger

// Menu item types
export enum MenuItemType {
  NORMAL = 'normal',
  SEPARATOR = 'separator',
  SUBMENU = 'submenu',
  CHECKBOX = 'checkbox',
  RADIO = 'radio'
}

// Menu identifiers - for easy reference
export enum MenuId {
  // File menu
  FILE_MENU = 'fileMenu',
  OPEN_FOLDER = 'openFolder',
  OPEN_FILE = 'openFile',
  SAVE_LOG = 'saveLog',
  EXIT = 'exit',
  
  // Edit menu
  EDIT_MENU = 'editMenu',
  COPY = 'copy',
  PASTE = 'paste',
  SELECT_ALL = 'selectAll',
  
  // View menu
  VIEW_MENU = 'viewMenu',
  TOGGLE_FULLSCREEN = 'toggleFullscreen',
  TOGGLE_DEVTOOLS = 'toggleDevTools',
  
  // Tools menu
  TOOLS_MENU = 'toolsMenu',
  RUN_PYTHON = 'runPython',
  RUN_EXE = 'runExe',
  CALIBRATION = 'calibration',
  BATCH_PROCESSING = 'batchProcessing',
  
  // Help menu
  HELP_MENU = 'helpMenu',
  ABOUT = 'about',
  CHECK_UPDATES = 'checkUpdates',
  DOCUMENTATION = 'documentation'
}

// Action types for menu items
export enum MenuActionType {
  DIALOG = 'dialog',
  FUNCTION = 'function',
  TOGGLE = 'toggle',
  NAVIGATE = 'navigate'
}

// Define shortcuts by platform
export const SHORTCUTS = {
  openFolder: process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O',
  openFile: process.platform === 'darwin' ? 'Command+Shift+O' : 'Ctrl+Shift+O',
  save: process.platform === 'darwin' ? 'Command+S' : 'Ctrl+S',
  exit: process.platform === 'darwin' ? 'Command+Q' : 'Alt+F4',
  copy: process.platform === 'darwin' ? 'Command+C' : 'Ctrl+C',
  paste: process.platform === 'darwin' ? 'Command+V' : 'Ctrl+V',
  selectAll: process.platform === 'darwin' ? 'Command+A' : 'Ctrl+A',
  toggleFullscreen: process.platform === 'darwin' ? 'Command+F' : 'F11',
  toggleDevTools: process.platform === 'darwin' ? 'Alt+Command+I' : 'F12',
  help: 'F1',
}

// Define the role mapping
export const ROLES = {
  copy: 'copy',
  paste: 'paste',
  selectAll: 'selectAll',
  quit: 'quit',
  togglefullscreen: 'togglefullscreen',
  toggleDevTools: 'toggleDevTools',
  minimize: 'minimize',
  close: 'close',
  about: 'about',
}

// Handler functions for custom menu actions
export const menuActionHandlers = {
  openFolderDialog: async (window: BrowserWindow) => {
    logger.log('Opening folder dialog from menu')
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      window.webContents.send('menu-action', {
        action: 'open-folder',
        path: result.filePaths[0]
      })
    }
  },
  
  openFileDialog: async (window: BrowserWindow) => {
    logger.log('Opening file dialog from menu')
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'tif', 'tiff'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    if (!result.canceled && result.filePaths.length > 0) {
      window.webContents.send('menu-action', {
        action: 'open-file',
        path: result.filePaths[0]
      })
    }
  },
  
  exportLog: async (window: BrowserWindow) => {
    logger.log('Exporting log file from menu')
    window.webContents.send('menu-action', {
      action: 'export-log'
    })
  },
  
  toggleDevTools: (window: BrowserWindow) => {
    window.webContents.toggleDevTools()
    logger.log('DevTools toggled from menu')
  },
  
  showAbout: () => {
    logger.log('Showing about dialog from menu')
    dialog.showMessageBox({
      title: 'About Drone Image Analysis Tool',
      message: 'Drone Image Analysis Tool',
      detail: `Version: 1.0.0\nElectron: ${process.versions.electron}\nChrome: ${process.versions.chrome}\nNode: ${process.versions.node}`,
      buttons: ['OK'],
      type: 'info'
    })
  },
  
  openDocumentation: () => {
    logger.log('Opening documentation from menu')
    shell.openExternal('https://example.com/documentation')
  }
}

// Export menu item template factory function for reusability
export const createMenuItemTemplate = (
  id: MenuId, 
  label: string, 
  accelerator?: string,
  role?: string,
  type: MenuItemType = MenuItemType.NORMAL,
  submenu?: any[],
  click?: (menuItem: Electron.MenuItem, browserWindow: BrowserWindow | undefined) => void,
  checked?: boolean
) => {
  return {
    id,
    label,
    accelerator,
    role,
    type,
    submenu,
    click,
    checked
  }
}

// Export app name for consistent usage
export const APP_NAME = 'Drone Image Analysis Tool'
