import { ipcMain, Notification } from 'electron'
import { logger } from '../main'

/**
 * Register all notification and logging related IPC handlers
 */
export function registerNotificationHandlers() {
  // Show notification
  ipcMain.handle('show-notification', async (_, options: { title: string, body: string, urgency?: 'low' | 'normal' | 'critical', actions?: { text: string, type: 'button' }[] }) => {
    try {
      // Always log notifications, but only show critical ones
      logger.log(`Notification: ${options.title} - ${options.body}`, options.urgency === 'critical' ? 'warn' : 'info')
      logger.logToCSV({
        event: 'notification',
        title: options.title,
        body: options.body,
        urgency: options.urgency || 'normal',
        timestamp: new Date().toISOString()
      })

      // Only show system notifications for critical urgency
      if (options.urgency === 'critical') {
        const notification = new Notification({
          title: options.title,
          body: options.body,
          actions: options.actions
        })
        notification.show()
      }
      
      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  })

  // Log event
  ipcMain.handle('log-event', async (_, message: string, level = 'info') => {
    try {
      logger.log(message, level as 'info' | 'warn' | 'error')
      return true
    } catch (error) {
      console.error('Error logging event:', error)
      return false
    }
  })

  // Log data to CSV
  ipcMain.handle('log-data', async (_, data: Record<string, any>) => {
    try {
      return logger.logToCSV(data)
    } catch (error) {
      console.error('Error logging data to CSV:', error)
      return false
    }
  })
}
