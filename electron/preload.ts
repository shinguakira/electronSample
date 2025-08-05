import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  api: {
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    openFileDialog: (options: { filters?: { name: string, extensions: string[] }[] }) => 
      ipcRenderer.invoke('open-file-dialog', options),
    getFolderContents: (folderPath: string) => 
      ipcRenderer.invoke('get-folder-contents', folderPath),
    openNotepad: (filePath?: string) => ipcRenderer.invoke('open-notepad', filePath),
    getConfigData: () => ipcRenderer.invoke('get-config-data'),
    getExecutionTime: () => ipcRenderer.invoke('get-execution-time'),
    runPythonCode: (code: string) => ipcRenderer.invoke('run-python-code', code),
    runPythonFile: (filePath: string) => ipcRenderer.invoke('run-python-file', filePath),
    checkPythonInstalled: () => ipcRenderer.invoke('check-python-installed'),
    // New EXE execution functions
    runExeFile: (filePath: string, args: string[] = []) => 
      ipcRenderer.invoke('run-exe-file', filePath, args),
    runExeCommand: (command: string) => 
      ipcRenderer.invoke('run-exe-command', command),
    
    // Notification functions
    showNotification: (options: { title: string, body: string, urgency?: 'low' | 'normal' | 'critical', actions?: { text: string, type: 'button' }[] }) => 
      ipcRenderer.invoke('show-notification', options),
    
    // Logging functions
    logEvent: (message: string, level: 'info' | 'warn' | 'error' = 'info') => 
      ipcRenderer.invoke('log-event', message, level),
    logData: (data: Record<string, any>) => 
      ipcRenderer.invoke('log-data', data),
      
    // Session time
    getSessionTime: () => 
      ipcRenderer.invoke('get-session-time'),
      
    // File utilities
    readTextFile: (filePath: string) => 
      ipcRenderer.invoke('read-text-file', filePath),
    writeTextFile: (filePath: string, content: string, append = false) => 
      ipcRenderer.invoke('write-text-file', { filePath, content, append }),
      
    readJsonFile: (filePath: string) => 
      ipcRenderer.invoke('read-json-file', filePath),
    writeJsonFile: (filePath: string, data: any, pretty = true) => 
      ipcRenderer.invoke('write-json-file', { filePath, data, pretty }),
      
    readCsvFile: (filePath: string, hasHeader = true) => 
      ipcRenderer.invoke('read-csv-file', { filePath, hasHeader }),
    writeCsvFile: (filePath: string, data: any[], headers?: string[]) => 
      ipcRenderer.invoke('write-csv-file', { filePath, data, headers }),
      
    readBinaryFile: (filePath: string) => 
      ipcRenderer.invoke('read-binary-file', filePath),
    writeBinaryFile: (filePath: string, data: Uint8Array) => 
      ipcRenderer.invoke('write-binary-file', { filePath, data }),
      
    fileExists: (filePath: string) => 
      ipcRenderer.invoke('file-exists', filePath),
    getFileStats: (filePath: string) => 
      ipcRenderer.invoke('get-file-stats', filePath),
    ensureDir: (dirPath: string, recursive = true) => 
      ipcRenderer.invoke('ensure-dir', { dirPath, recursive }),
    copyFile: (sourcePath: string, destPath: string) => 
      ipcRenderer.invoke('copy-file', { sourcePath, destPath }),
    deleteFile: (filePath: string) => 
      ipcRenderer.invoke('delete-file', filePath)
  },

  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})
