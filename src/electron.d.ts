// Type definitions for Electron IPC in renderer process
import { IpcRenderer } from 'electron';

declare global {
  interface Window {
    ipcRenderer: {
      api: {
        openFolderDialog: () => Promise<string | undefined>;
        openFileDialog: (options: { filters?: { name: string, extensions: string[] }[] }) => Promise<string | undefined>;
        getFolderContents: (folderPath: string) => Promise<Array<{ name: string, isDirectory: boolean, path: string }>>;
        openNotepad: (filePath?: string) => Promise<boolean>;
        getConfigData: () => Promise<any>;
        getExecutionTime: () => Promise<number>;
        runPythonCode: (code: string) => Promise<any>;
        runPythonFile: (filePath: string) => Promise<any>;
        checkPythonInstalled: () => Promise<{ installed: boolean, version: string }>;
        runExeFile: (filePath: string, args?: string[]) => Promise<any>;
        runExeCommand: (command: string) => Promise<any>;
        
        // New notification and logging functions
        showNotification: (options: { 
          title: string, 
          body: string, 
          urgency?: 'low' | 'normal' | 'critical', 
          actions?: { text: string, type: 'button' }[] 
        }) => Promise<boolean>;
        logEvent: (message: string, level?: 'info' | 'warn' | 'error') => Promise<boolean>;
        logData: (data: Record<string, any>) => Promise<boolean>;
        getSessionTime: () => Promise<number>;
      };
      on: (channel: string, func: (...args: any[]) => void) => void;
      once: (channel: string, func: (...args: any[]) => void) => void;
      off: (channel: string, func: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}

export {};
