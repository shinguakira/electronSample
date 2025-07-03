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

interface PythonResult {
  success: boolean
  output: string
  error: string
}

function App() {
  // Helper function to format execution time in a human-readable format
  const formatExecutionTime = (milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    }
    
    const seconds = Math.floor(milliseconds / 1000) % 60
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60
    const hours = Math.floor(milliseconds / (1000 * 60 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }
  // State variables
  const [currentFolder, setCurrentFolder] = useState<string>('')
  const [folderContents, setFolderContents] = useState<FolderItem[]>([])
  const [progress, setProgress] = useState<number>(0)
  const [progressOperation, setProgressOperation] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [configData, setConfigData] = useState<any>(null)
  const [executionTime, setExecutionTime] = useState<number>(0)
  
  // Python execution state
  const [pythonCode, setPythonCode] = useState<string>('print("Hello from Python!")')
  const [pythonResult, setPythonResult] = useState<PythonResult | null>(null)
  const [isPythonInstalled, setIsPythonInstalled] = useState<boolean>(false)
  const [pythonVersion, setPythonVersion] = useState<string>('')
  const [runningPython, setRunningPython] = useState<boolean>(false)
  
  // EXE execution state
  const [exeCommand, setExeCommand] = useState<string>('')
  const [exeResult, setExeResult] = useState<PythonResult | null>(null)
  const [runningExe, setRunningExe] = useState<boolean>(false)
  
  // Task progress state (for custom progress display in the left panel)
  const [taskProgress, setTaskProgress] = useState<number>(0)
  const [taskName, setTaskName] = useState<string>('')
  const [taskDescription, setTaskDescription] = useState<string>('')
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false)
  
  // Calibration specific progress bars
  const [searchOffsetProgress, setSearchOffsetProgress] = useState<number>(0)
  const [correctOffsetProgress, setCorrectOffsetProgress] = useState<number>(0)
  const [correctingCalibrationProgress, setCorrectingCalibrationProgress] = useState<number>(0)
  
  // Check if Python is installed when component mounts
  useEffect(() => {
    const checkPythonInstalled = async () => {
      try {
        const result = await window.ipcRenderer.invoke('check-python-installed')
        setIsPythonInstalled(result.installed)
        setPythonVersion(result.version)
      } catch (error) {
        console.error('Error checking Python installation:', error)
        setIsPythonInstalled(false)
      }
    }
    
    checkPythonInstalled()
  }, [])

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
  
  // Update execution time every second
  useEffect(() => {
    const updateExecutionTime = async () => {
      try {
        const time = await window.ipcRenderer.invoke('get-execution-time')
        setExecutionTime(time)
      } catch (error) {
        console.error('Error getting execution time:', error)
      }
    }
    
    // Update immediately
    updateExecutionTime()
    
    // Set up interval to update the execution time every second
    const interval = setInterval(updateExecutionTime, 1000)
    
    // Clear interval on component unmount
    return () => clearInterval(interval)
  }, [])
  
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
    } else if (item.path.toLowerCase().endsWith('.py')) {
      runPythonFile(item.path)
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

  // Run Python code entered in the text area
  const runPythonCode = async () => {
    if (runningPython || !isPythonInstalled) return
    
    setRunningPython(true)
    setPythonResult(null)
    startTaskProgress('Running Python Code', 'Executing Python code...')
    
    // Reset calibration progress bars
    setSearchOffsetProgress(0)
    setCorrectOffsetProgress(0)
    setCorrectingCalibrationProgress(0)
    
    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress(prev => {
          const newProgress = prev + (10 * Math.random())
          return newProgress > 90 ? 90 : newProgress
        })
        
        // Simulate progress for the calibration stages
        setSearchOffsetProgress(prev => {
          const newProgress = prev + (15 * Math.random())
          return newProgress > 100 ? 100 : newProgress
        })
        
        setTimeout(() => {
          setCorrectOffsetProgress(prev => {
            const newProgress = prev + (10 * Math.random())
            return newProgress > 100 ? 100 : newProgress
          })
        }, 500)
        
        setTimeout(() => {
          setCorrectingCalibrationProgress(prev => {
            const newProgress = prev + (5 * Math.random())
            return newProgress > 100 ? 100 : newProgress
          })
        }, 1000)
      }, 200)
      
      // Run Python code
      const result = await window.ipcRenderer.invoke('run-python-code', pythonCode)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setSearchOffsetProgress(100)
      setCorrectOffsetProgress(100)
      setCorrectingCalibrationProgress(100)
      setTaskDescription(result.success ? 'Python code executed successfully!' : 'Python execution failed!')
      setPythonResult(result)
      
      setTimeout(() => {
        completeTaskProgress()
        setRunningPython(false)
      }, 1000)
      
    } catch (error) {
      failTaskProgress()
      setRunningPython(false)
      setPythonResult({ 
        success: false, 
        output: '', 
        error: error instanceof Error ? error.message : String(error) 
      })
    }
  }
  
  // Run a Python file
  const runPythonFile = async (filePath: string) => {
    try {
      setRunningPython(true)
      setPythonResult(null)
      startTaskProgress('Running Python File', `Executing ${filePath}...`)
      
      try {
        // Update progress during execution
        const progressInterval = setInterval(() => {
          setTaskProgress(prev => {
            const newProgress = prev + (10 * Math.random())
            return newProgress > 90 ? 90 : newProgress
          })
        }, 200)
        
        // Run Python file
        const result = await window.ipcRenderer.invoke('run-python-file', filePath)
        clearInterval(progressInterval)
        setTaskProgress(100)
        setTaskDescription(result.success ? 'Python file executed successfully!' : 'Python file execution failed!')
        setPythonResult(result)
        
        setTimeout(() => {
          completeTaskProgress()
          setRunningPython(false)
        }, 1000)
        
      } catch (error) {
        failTaskProgress()
        setRunningPython(false)
        setPythonResult({ 
          success: false, 
          output: '', 
          error: error instanceof Error ? error.message : String(error) 
        })
      }
    } catch (error) {
      console.error('Error running Python file:', error)
      setErrorMessage('Failed to run Python file')
    }
  }
  
  // Run EXE command
  const runExeCommand = async () => {
    if (runningExe || !exeCommand) return
    
    setRunningExe(true)
    setExeResult(null)
    startTaskProgress('Running Command', 'Executing command...')
    
    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress(prev => {
          const newProgress = prev + (10 * Math.random())
          return newProgress > 90 ? 90 : newProgress
        })
      }, 200)
      
      // Run EXE command
      const result = await window.ipcRenderer.invoke('run-exe-command', exeCommand)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setTaskDescription(result.success ? 'Command executed successfully!' : 'Command execution failed!')
      setExeResult(result)
      
      setTimeout(() => {
        completeTaskProgress()
        setRunningExe(false)
      }, 1000)
      
    } catch (error) {
      failTaskProgress()
      setRunningExe(false)
      setExeResult({ 
        success: false, 
        output: '', 
        error: error instanceof Error ? error.message : String(error) 
      })
    }
  }
  
  // Handle selecting a Python file to run
  const selectPythonFile = async () => {
    if (runningPython || !isPythonInstalled) return
    
    const filePath = await window.ipcRenderer.invoke('open-file-dialog', { 
      filters: [{ name: 'Python Files', extensions: ['py'] }] 
    })
    
    if (filePath) {
      runPythonFile(filePath)
    }
  }
  
  // Handle selecting an EXE file to run
  const selectExeFile = async () => {
    if (runningExe) return
    
    const filePath = await window.ipcRenderer.invoke('open-file-dialog', { 
      filters: [{ name: 'Executable Files', extensions: ['exe'] }] 
    })
    
    if (!filePath) return
    
    setRunningExe(true)
    setExeResult(null)
    startTaskProgress('Running Executable', `Executing ${filePath}...`)
    
    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress(prev => {
          const newProgress = prev + (10 * Math.random())
          return newProgress > 90 ? 90 : newProgress
        })
      }, 200)
      
      // Run EXE file
      const result = await window.ipcRenderer.invoke('run-exe-file', filePath)
      clearInterval(progressInterval)
      setTaskProgress(100)
      setTaskDescription(result.success ? 'Executable file ran successfully!' : 'Executable file execution failed!')
      setExeResult(result)
      
      setTimeout(() => {
        completeTaskProgress()
        setRunningExe(false)
      }, 1000)
      
    } catch (error) {
      failTaskProgress()
      setRunningExe(false)
      setExeResult({ 
        success: false, 
        output: '', 
        error: error instanceof Error ? error.message : String(error) 
      })
    }
  }
  

  // Task progress management functions
  const startTaskProgress = (name: string, description: string) => {
    setTaskName(name)
    setTaskDescription(description)
    setTaskProgress(0)
    setIsTaskRunning(true)
    
    // Animate progress
    const interval = setInterval(() => {
      setTaskProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 10
      })
    }, 300)
    
    // Store interval ID to clear it later
    return interval
  }
  
  const completeTaskProgress = () => {
    setTaskProgress(100)
    setTimeout(() => {
      setIsTaskRunning(false)
    }, 1500)
  }
  
  const failTaskProgress = () => {
    setTaskProgress(100)
    setTaskDescription(prev => `${prev} - Failed`)
    setTimeout(() => {
      setIsTaskRunning(false)
    }, 1500)
  }
  
  return (
    <div className="container">
      <div className="header">
        <h1>{configData?.AppSettings?.Title || 'Eye Camera Calibration Tool'}</h1>
        <div className="app-info">
          <div className="execution-time">
            <strong>Session time:</strong> {formatExecutionTime(executionTime)}
          </div>
          <div className="logo-container">
            <img src={viteLogo} className="logo" alt="Vite logo" />
            <img src={reactLogo} className="logo react" alt="React logo" />
          </div>
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
        <div className="control-group">
          <button onClick={openFolderDialog} className="primary-button">Load Patient Images</button>
          {currentFolder && <button onClick={navigateToParent}>Parent Folder</button>}
          <button onClick={() => openNotepad()} className="utility-button">Open Notepad</button>
        </div>
        
        <div className="control-group">
          {isPythonInstalled && (
            <>
              <button 
                onClick={runPythonCode} 
                disabled={runningPython}
                className={`action-button ${runningPython ? 'disabled' : ''}`}
              >
                Run Calibration
              </button>
              <button 
                onClick={selectPythonFile} 
                disabled={runningPython}
                className={runningPython ? 'disabled' : ''}
              >
                Load Calibration Script
              </button>
            </>
          )}
          <button 
            onClick={selectExeFile}
            disabled={runningExe}
            className={`tool-button ${runningExe ? 'disabled' : ''}`}
          >
            Run EXE File
          </button>
        </div>
      </div>
      

      
      {/* Main Content with two-panel layout */}
      <div className="main-content">
        {/* Left Panel - Python Calibration Code */}
        <div className="left-panel">
          <div className="panel-header">
            <h2>Calibration Script</h2>
            <div className="execution-info">
              {isPythonInstalled ? (
                <span className="python-status good">Python {pythonVersion} Detected</span>
              ) : (
                <span className="python-status error">Python Not Found</span>
              )}
              <span className="execution-time">Uptime: {formatExecutionTime(executionTime)}</span>
            </div>
          </div>
          
          {isTaskRunning && (
            <div className="task-progress">
              <div className="task-info">
                <div className="task-name">{taskName}</div>
                <div className="task-description">{taskDescription}</div>
              </div>
              <div className="progress-bar custom">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${taskProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <div className="calibration-progress-bars">
            <div className="category-progress">
              <div className="category-label">Search Offset</div>
              <div className="progress-bar search-offset">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${searchOffsetProgress}%` }}
                ></div>
              </div>
              <div className="progress-value">{searchOffsetProgress}%</div>
            </div>
            
            <div className="category-progress">
              <div className="category-label">Correct Offset</div>
              <div className="progress-bar correct-offset">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${correctOffsetProgress}%` }}
                ></div>
              </div>
              <div className="progress-value">{correctOffsetProgress}%</div>
            </div>
            
            <div className="category-progress">
              <div className="category-label">Correcting Calibration</div>
              <div className="progress-bar correcting-calibration">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${correctingCalibrationProgress}%` }}
                ></div>
              </div>
              <div className="progress-value">{Math.round(correctingCalibrationProgress)}%</div>
            </div>
          </div>
          
          {/* Python Input Section */}
          {isPythonInstalled ? (
            <div className="python-section">
              <div className="python-header">
                <div className="calibration-header">
                  <h4>Camera Calibration Script</h4>
                  <div className="python-status success">
                    <span className="status-dot"></span>
                    Python {pythonVersion} ready
                  </div>
                </div>
              </div>
              
              <div className="python-editor">
                    <textarea
                      value={pythonCode || `# Eye Camera Calibration Script
import cv2
import numpy as np

def process_eye_image(image_path):
    # Load image
    img = cv2.imread(image_path)
    
    # Apply calibration adjustments
    # 1. Color correction
    # 2. Distortion correction
    # 3. Focus measurement
    
    # Return calibration parameters and corrected image
    return {
        "focus_score": 0.92,
        "color_balance": [0.8, 1.0, 1.1],
        "distortion": 0.05,
        "calibrated_image": img
    }

# Process selected image
result = process_eye_image("patient_image.jpg")
print("Calibration complete!")
print(f"Focus score: {result['focus_score']}")
print(f"Color balance (RGB): {result['color_balance']}")
print(f"Distortion coefficient: {result['distortion']}")`}
                    onChange={(e) => setPythonCode(e.target.value)}
                    disabled={runningPython}
                    placeholder="Enter calibration algorithm here..."
                  />
                </div>
                
              <div className="script-actions">
                  <button 
                    className="script-action-button"
                    title="Load a sample calibration script"
                  >
                    Load Template
                  </button>
                  <button 
                    className="script-action-button"
                    title="Save current script"
                  >
                    Save Script
                  </button>
                </div>
            </div>
          ) : (
            <div className="python-section">
                <div className="python-header">
                  <div className="python-status error">
                    <span className="status-dot"></span>
                    Python not installed or not found
                  </div>
                </div>
                <p className="python-not-installed">
                  Please install Python with OpenCV to use the calibration features.
                </p>
              </div>
          )}
        </div>
        
        {/* Right Panel - Image Preview */}
        <div className="right-panel">
          <div className="panel-title">Image Preview</div>
          
          <div className="panel-content image-preview-panel">
            {/* Mock Image Preview */}
            <div className="image-preview">
              <div className="image-placeholder">
                {currentFolder ? (
                  <div className="mock-eye-image">
                    <div className="mock-eye-iris"></div>
                    <div className="mock-eye-pupil"></div>
                    <div className="calibration-grid"></div>
                    <div className="calibration-crosshair"></div>
                  </div>
                ) : (
                  <div className="no-image-message">Select patient image folder to load images</div>
                )}
              </div>
            </div>
            
            {/* Calibration Parameters */}
            <div className="calibration-parameters">
              <h3>Calibration Parameters</h3>
              <div className="parameter-sliders">
                <div className="parameter-slider">
                  <label>Focus Adjustment</label>
                  <input type="range" min="0" max="100" defaultValue="75" />
                  <div className="slider-value">0.75</div>
                </div>
                <div className="parameter-slider">
                  <label>Color Balance</label>
                  <input type="range" min="0" max="100" defaultValue="50" />
                  <div className="slider-value">1.0</div>
                </div>
                <div className="parameter-slider">
                  <label>Distortion Correction</label>
                  <input type="range" min="0" max="100" defaultValue="20" />
                  <div className="slider-value">0.2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Results Area - Full Width */}
      <div className="log-output-area results-area">
        <div className="log-title">Calibration Results</div>
        <div className="log-content results-content">
          <div className="results-columns">
            <div className="results-column">
              <h3>Analysis</h3>
              {pythonResult ? (
                <div className={`python-result ${pythonResult?.success ? 'success' : 'error'}`}>
                  <pre className="calibration-output">{pythonResult?.success ? pythonResult?.output : pythonResult?.error}</pre>
                </div>
              ) : (
                <div className="calibration-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Focus Score:</span>
                    <span className="metric-value">0.92</span>
                    <span className="metric-rating good">GOOD</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Color Balance (RGB):</span>
                    <span className="metric-value">[0.8, 1.0, 1.1]</span>
                    <span className="metric-rating warning">ADJUST</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Distortion:</span>
                    <span className="metric-value">0.05</span>
                    <span className="metric-rating good">GOOD</span>
                  </div>
                </div>
              )}
            </div>
            <div className="results-column">
              <h3>EXE Execution</h3>
              {exeResult ? (
                <div className={`exe-result ${exeResult?.success ? 'success' : 'error'}`}>
                  <h4>{exeResult?.success ? 'Output:' : 'Error:'}</h4>
                  <pre className="exe-output">{exeResult?.success ? exeResult?.output : exeResult?.error}</pre>
                </div>
              ) : (
                <div className="exe-input-area">
                  <div className="exe-command-input">
                    <textarea
                      value={exeCommand}
                      onChange={(e) => setExeCommand(e.target.value)}
                      disabled={runningExe}
                      placeholder="Enter command to execute..."
                      className="exe-command-textarea"
                    />
                  </div>
                  <div className="exe-actions">
                    <button 
                      onClick={runExeCommand}
                      disabled={runningExe || !exeCommand}
                      className="exe-action-button">
                      Run Command
                    </button>
                    <button 
                      onClick={selectExeFile}
                      disabled={runningExe}
                      className="exe-action-button">
                      Select EXE File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="calibration-history">
            <h3>Execution History</h3>
            <div className="history-entries">
              <div className="history-entry">Today 14:32 - Patient ID: 12345 - Focus: 0.92 - Color: [0.8, 1.0, 1.1]</div>
              <div className="history-entry">Today 14:15 - EXE executed: notepad.exe - Result: Success</div>
              <div className="history-entry">Today 13:50 - Patient ID: 12343 - Focus: 0.95 - Color: [1.0, 1.0, 1.0]</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient Images Browser */}
      {configData?.Features?.ShowFileBrowser !== false && (
        <div className="folder-explorer-container">
          <h3>Patient Images</h3>
          <div className="folder-explorer patient-images">
            {folderContents.length > 0 ? (
              <div className="image-grid">
                {folderContents.map((item, index) => {
                  const isImage = item.name.toLowerCase().endsWith('.jpg') || 
                                 item.name.toLowerCase().endsWith('.png') ||
                                 item.name.toLowerCase().endsWith('.bmp');
                  return (
                    <div 
                      key={index} 
                      className={`image-item ${isImage ? 'image-file' : item.isDirectory ? 'directory' : 'other-file'}`} 
                      onClick={() => openItem(item)}
                    >
                      {isImage ? (
                        <div className="thumbnail">
                          <div className="mock-thumbnail"></div>
                        </div>
                      ) : (
                        item.isDirectory ? '📁' : '📄'
                      )}
                      <div className="image-name">{item.name}</div>
                      {isImage && <div className="image-select-overlay">Select</div>}
                    </div>
                  );
                })}
              </div>
            ) : currentFolder ? (
              <div className="empty-folder">No images found in this folder</div>
            ) : (
              <div className="no-folder">Please select a patient images folder</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
