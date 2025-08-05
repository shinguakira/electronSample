import { ipcMain } from 'electron'

/**
 * Register all session-related IPC handlers
 */
export function registerSessionHandlers(appStartTime: number) {
  // Get execution time (how long the app has been running)
  ipcMain.handle('get-execution-time', () => {
    const executionTimeMs = Date.now() - appStartTime
    return executionTimeMs
  })

  // Get session time
  ipcMain.handle('get-session-time', () => {
    return Date.now() - appStartTime
  })

  // Get config data
  ipcMain.handle('get-config-data', (_, key = null) => {
    if (key === null) {
      return global.configData || {}
    }
    return global.configData?.[key] || null
  })
}
