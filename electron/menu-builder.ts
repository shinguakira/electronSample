import { Menu, BrowserWindow } from 'electron'
import { 
  MenuId, 
  MenuItemType, 
  SHORTCUTS, 
  ROLES,
  menuActionHandlers,
  createMenuItemTemplate,
  APP_NAME
} from './menu-constants'

/**
 * Builds the application menu
 */
export function buildApplicationMenu(mainWindow: BrowserWindow) {
  const template = [
    // File Menu
    {
      label: 'File',
      submenu: [
        createMenuItemTemplate(
          MenuId.OPEN_FOLDER, 
          'Open Folder...', 
          SHORTCUTS.openFolder, 
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.openFolderDialog(mainWindow)
        ),
        createMenuItemTemplate(
          MenuId.OPEN_FILE, 
          'Open File...', 
          SHORTCUTS.openFile, 
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.openFileDialog(mainWindow)
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.SAVE_LOG, 
          'Export Log...', 
          SHORTCUTS.save, 
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.exportLog(mainWindow)
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.EXIT, 
          'Exit', 
          SHORTCUTS.exit, 
          ROLES.quit
        )
      ]
    },
    
    // Edit Menu
    {
      label: 'Edit',
      submenu: [
        createMenuItemTemplate(MenuId.COPY, 'Copy', SHORTCUTS.copy, ROLES.copy),
        createMenuItemTemplate(MenuId.PASTE, 'Paste', SHORTCUTS.paste, ROLES.paste),
        createMenuItemTemplate(MenuId.SELECT_ALL, 'Select All', SHORTCUTS.selectAll, ROLES.selectAll)
      ]
    },
    
    // View Menu
    {
      label: 'View',
      submenu: [
        createMenuItemTemplate(
          MenuId.TOGGLE_FULLSCREEN,
          'Toggle Full Screen',
          SHORTCUTS.toggleFullscreen,
          ROLES.togglefullscreen
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.TOGGLE_DEVTOOLS,
          'Toggle Developer Tools',
          SHORTCUTS.toggleDevTools,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.toggleDevTools(mainWindow)
        )
      ]
    },
    
    // Tools Menu
    {
      label: 'Tools',
      submenu: [
        createMenuItemTemplate(
          MenuId.RUN_PYTHON,
          'Run Python Script',
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => mainWindow.webContents.send('menu-action', { action: 'run-python' })
        ),
        createMenuItemTemplate(
          MenuId.RUN_EXE,
          'Run Executable',
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => mainWindow.webContents.send('menu-action', { action: 'run-exe' })
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.CALIBRATION,
          'Calibration Wizard',
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => mainWindow.webContents.send('menu-action', { action: 'calibration-wizard' })
        ),
        createMenuItemTemplate(
          MenuId.BATCH_PROCESSING,
          'Batch Processing',
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => mainWindow.webContents.send('menu-action', { action: 'batch-processing' })
        )
      ]
    },
    
    // Help Menu
    {
      label: 'Help',
      submenu: [
        createMenuItemTemplate(
          MenuId.DOCUMENTATION,
          'Documentation',
          SHORTCUTS.help,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.openDocumentation()
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.CHECK_UPDATES,
          'Check for Updates',
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => mainWindow.webContents.send('menu-action', { action: 'check-updates' })
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(
          MenuId.ABOUT,
          `About ${APP_NAME}`,
          undefined,
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.showAbout()
        )
      ]
    }
  ]
  
  // Add special menu for macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: APP_NAME,
      submenu: [
        createMenuItemTemplate(
          MenuId.ABOUT, 
          `About ${APP_NAME}`, 
          undefined, 
          undefined,
          MenuItemType.NORMAL,
          undefined,
          () => menuActionHandlers.showAbout()
        ),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate('services' as any, 'Services', undefined, 'services'),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate('hide' as any, 'Hide', undefined, 'hide'),
        createMenuItemTemplate('hideOthers' as any, 'Hide Others', undefined, 'hideOthers'),
        createMenuItemTemplate('unhide' as any, 'Show All', undefined, 'unhide'),
        { type: MenuItemType.SEPARATOR },
        createMenuItemTemplate(MenuId.EXIT, 'Quit', SHORTCUTS.exit, ROLES.quit)
      ]
    })
  }
  
  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)
  
  return menu
}
