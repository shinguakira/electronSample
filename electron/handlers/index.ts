import { BrowserWindow } from 'electron'
import { registerFileHandlers } from './file-handlers'
import { registerDialogHandlers } from './dialog-handlers'
import { registerPythonHandlers } from './python-handlers'
import { registerNotificationHandlers } from './notification-handlers'
import { registerSessionHandlers } from './session-handlers'

/**
 * Register all IPC handlers for the application
 * @param mainWindow The main BrowserWindow instance
 * @param appStartTime The application start time in milliseconds
 */
export function registerAllHandlers(mainWindow: BrowserWindow, appStartTime: number) {
  // Register all handler groups
  registerFileHandlers()
  registerDialogHandlers(mainWindow)
  registerPythonHandlers()
  registerNotificationHandlers()
  registerSessionHandlers(appStartTime)
  
  console.log('All IPC handlers registered')
}
