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
      ipcRenderer.invoke('run-exe-command', command)
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
