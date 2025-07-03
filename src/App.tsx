import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'

// Define interface for folder items
interface FolderItem {
  name: string
  isDirectory: boolean
  path: string
}

function App() {
  // State variables
  const [currentFolder, setCurrentFolder] = useState<string>('')
  const [folderContents, setFolderContents] = useState<FolderItem[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [progressOperation, setProgressOperation] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [configData, setConfigData] = useState<any>(null)
  
  // Load INI configuration when component mounts
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setProgressOperation('Loading configuration...')
        setProgress(50)
        
        const config = await window.ipcRenderer.invoke('get-config-data')
        setConfigData(config)
        
        // Set initial folder if specified in config
        if (config?.AppSettings?.DefaultFolderPath && config.Features?.OpenLastFolder) {
          setCurrentFolder(config.AppSettings.DefaultFolderPath)
        }
        
        setProgress(100)
        setTimeout(() => setProgress(0), 1000)
      } catch (error) {
        console.error('Error loading configuration:', error)
        setErrorMessage('Failed to load configuration')
        setProgress(0)
      }
    }
    
    loadConfig()
  }, [])
  
  // Load folder contents when the current folder changes
  useEffect(() => {
    if (currentFolder) {
      loadFolderContents(currentFolder)
    }
  }, [currentFolder])
  
  // Open folder dialog
  const openFolderDialog = async () => {
    try {
      setProgressOperation('Opening folder dialog...')
      setProgress(30)
      
      const folderPath = await window.ipcRenderer.invoke('open-folder-dialog')
      setProgress(70)
      
      if (folderPath) {
        setCurrentFolder(folderPath)
      }
      
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      console.error('Error opening folder dialog:', error)
      setErrorMessage('Failed to open folder dialog')
      setProgress(0)
    }
  }
  
  // Load folder contents
  const loadFolderContents = async (folderPath: string) => {
    try {
      setProgressOperation('Loading folder contents...')
      setProgress(50)
      
      const contents = await window.ipcRenderer.invoke('get-folder-contents', folderPath)
      setFolderContents(contents)
      
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      console.error('Error loading folder contents:', error)
      setErrorMessage('Failed to load folder contents')
      setProgress(0)
    }
  }
  
  // Open file or folder
  const openItem = async (item: FolderItem) => {
    if (item.isDirectory) {
      setCurrentFolder(item.path)
    } else if (item.path.toLowerCase().endsWith('.txt')) {
      openNotepad(item.path)
    }
  }
  
  // Open Notepad
  const openNotepad = async (filePath?: string) => {
    try {
      setProgressOperation('Opening Notepad...')
      setProgress(50)
      
      await window.ipcRenderer.invoke('open-notepad', filePath)
      
      setProgress(100)
      setTimeout(() => setProgress(0), 1000)
    } catch (error) {
      console.error('Error opening Notepad:', error)
      setErrorMessage('Failed to open Notepad')
      setProgress(0)
    }
  }
  
  // Navigate to parent folder
  const navigateToParent = () => {
    if (currentFolder) {
      const parentFolder = currentFolder.split('\\').slice(0, -1).join('\\')
      if (parentFolder) {
        setCurrentFolder(parentFolder)
      }
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>{configData?.AppSettings?.Title || 'Electron File Explorer'}</h1>
        <div className="logo-container">
          <img src={viteLogo} className="logo" alt="Vite logo" />
          <img src={reactLogo} className="logo react" alt="React logo" />
        </div>
      </div>
      
      {/* Progress bar */}
      {progress > 0 && (
        <div className="progress-container">
          <div className="progress-label">{progressOperation}</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
          <button onClick={() => setErrorMessage('')}>✕</button>
        </div>
      )}
      
      <div className="controls">
        <button onClick={openFolderDialog}>Open Folder</button>
        <button onClick={() => openNotepad()}>Open Notepad</button>
        {currentFolder && <button onClick={navigateToParent}>Go Up</button>}
      </div>
      
      {/* Current folder path */}
      {currentFolder && (
        <div className="current-path">
          <strong>Current folder:</strong> {currentFolder}
        </div>
      )}
      
      {/* INI Configuration */}
      {configData && (
        <div className="config-display">
          <h3>Configuration Settings (from INI file)</h3>
          <div className="config-sections">
            {Object.keys(configData).map(section => (
              <div key={section} className="config-section">
                <h4>{section}</h4>
                <ul>
                  {Object.entries(configData[section]).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Folder contents */}
      <div className="folder-explorer">
        {folderContents.length > 0 ? (
          <ul className="file-list">
            {folderContents.map((item, index) => (
              <li key={index} className={item.isDirectory ? 'directory' : 'file'} onClick={() => openItem(item)}>
                {item.isDirectory ? '📁 ' : '📄 '}
                {item.name}
              </li>
            ))}
          </ul>
        ) : currentFolder ? (
          <div className="empty-folder">This folder is empty</div>
        ) : (
          <div className="no-folder">Please select a folder to browse</div>
        )}
      </div>
    </div>
  )
}

export default App
