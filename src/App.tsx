import React, { useState, useEffect, useCallback } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/electron-vite.animate.svg";
import "./globals.css";
import { Button } from "./components/ui/button";
import { DroneImageAnalysisTool } from "./components/drone-image-analysis-tool";

// Define interface for folder items
interface FolderItem {
  name: string;
  isDirectory: boolean;
  path: string;
}

interface PythonResult {
  success: boolean;
  output: string;
  error: string;
}

function App() {
  // Helper function to format execution time in a human-readable format
  const formatExecutionTime = (milliseconds: number | null): string => {
    if (!milliseconds) return '0ms';
    
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }

    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Set up state
  const [folderPath, setFolderPath] = useState("");
  const [folderContents, setFolderContents] = useState<FolderItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [menuActionMessage, setMenuActionMessage] = useState<string | null>(null);

  // State variables
  const [currentFolder, setCurrentFolder] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [progressOperation, setProgressOperation] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [configData, setConfigData] = useState<any>(null);

  // Python execution state
  const [pythonCode, setPythonCode] = useState<string>(
    'print("Hello from Python!")'
  );
  const [pythonResult, setPythonResult] = useState<PythonResult | null>(null);
  const [isPythonInstalled, setIsPythonInstalled] = useState<boolean>(false);
  const [pythonVersion, setPythonVersion] = useState<string>("");
  const [runningPython, setRunningPython] = useState<boolean>(false);

  // EXE execution state
  const [exeCommand, setExeCommand] = useState<string>("");
  const [exeResult, setExeResult] = useState<PythonResult | null>(null);
  const [runningExe, setRunningExe] = useState<boolean>(false);

  // Task progress state (for custom progress display in the left panel)
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskName, setTaskName] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false);

  // Calibration specific progress bars
  const [searchOffsetProgress, setSearchOffsetProgress] = useState<number>(0);
  const [correctOffsetProgress, setCorrectOffsetProgress] = useState<number>(0);
  const [correctingCalibrationProgress, setCorrectingCalibrationProgress] =
    useState<number>(0);

  // We'll declare handleMenuAction after all other functions are declared to avoid "used before declaration" errors
  
  // Check if Python is installed when component mounts
  useEffect(() => {
    const checkPythonInstalled = async () => {
      try {
        const result = await window.ipcRenderer.invoke(
          "check-python-installed"
        );
        setIsPythonInstalled(result.installed);
        setPythonVersion(result.version);
      } catch (error) {
        console.error("Error checking Python installation:", error);
        setIsPythonInstalled(false);
      }
    };

    checkPythonInstalled();
  }, []);

  // Load INI configuration when component mounts
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setProgressOperation("Loading configuration...");
        setProgress(50);

        const config = await window.ipcRenderer.invoke("get-config-data");
        setConfigData(config);

        // Set initial folder if specified in config
        if (
          config?.AppSettings?.DefaultFolderPath &&
          config.Features?.OpenLastFolder
        ) {
          setCurrentFolder(config.AppSettings.DefaultFolderPath);
        }

        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
      } catch (error) {
        console.error("Error loading configuration:", error);
        setErrorMessage("Failed to load configuration");
        setProgress(0);
      }
    };

    loadConfig();
  }, []);

  // Load folder contents when the current folder changes
  useEffect(() => {
    if (currentFolder) {
      loadFolderContents(currentFolder);
    }
  }, [currentFolder]);

  // Update execution time every second
  useEffect(() => {
    const updateExecutionTime = async () => {
      try {
        const time = await window.ipcRenderer.invoke("get-execution-time");
        setExecutionTime(time);
      } catch (error) {
        console.error("Error getting execution time:", error);
      }
    };

    // Update immediately
    updateExecutionTime();

    // Set up interval to update the execution time every second
    const interval = setInterval(updateExecutionTime, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Open folder dialog
  const openFolderDialog = async () => {
    try {
      setProgressOperation("Opening folder dialog...");
      setProgress(30);

      const folderPath = await window.ipcRenderer.invoke("open-folder-dialog");
      setProgress(70);

      if (folderPath) {
        setCurrentFolder(folderPath);
      }

      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error("Error opening folder dialog:", error);
      setErrorMessage("Failed to open folder dialog");
      setProgress(0);
    }
  };

  // Load folder contents
  const loadFolderContents = async (folderPath: string) => {
    try {
      setProgressOperation("Loading folder contents...");
      setProgress(50);

      const contents = await window.ipcRenderer.invoke(
        "get-folder-contents",
        folderPath
      );
      setFolderContents(contents);

      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error("Error loading folder contents:", error);
      setErrorMessage("Failed to load folder contents");
      setProgress(0);
    }
  };

  // Open file or folder
  const openItem = async (item: FolderItem) => {
    if (item.isDirectory) {
      setCurrentFolder(item.path);
    } else if (item.path.toLowerCase().endsWith(".txt")) {
      openNotepad(item.path);
    } else if (item.path.toLowerCase().endsWith(".py")) {
      runPythonFile(item.path);
    }
  };

  // Open Notepad
  const openNotepad = async (filePath?: string) => {
    try {
      setProgressOperation("Opening Notepad...");
      setProgress(50);

      await window.ipcRenderer.invoke("open-notepad", filePath);

      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (error) {
      console.error("Error opening Notepad:", error);
      setErrorMessage("Failed to open Notepad");
      setProgress(0);
    }
  };

  // Navigate to parent folder
  const navigateToParent = () => {
    if (currentFolder) {
      const parentFolder = currentFolder.split("\\").slice(0, -1).join("\\");
      if (parentFolder) {
        setCurrentFolder(parentFolder);
      }
    }
  };

  // Run Python code entered in the text area
  const runPythonCode = async () => {
    if (runningPython || !isPythonInstalled) return;

    setRunningPython(true);
    setPythonResult(null);
    startTaskProgress("Running Python Code", "Executing Python code...");

    // Reset calibration progress bars
    setSearchOffsetProgress(0);
    setCorrectOffsetProgress(0);
    setCorrectingCalibrationProgress(0);

    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 10 * Math.random();
          return newProgress > 90 ? 90 : newProgress;
        });

        // Simulate progress for the calibration stages
        setSearchOffsetProgress((prev) => {
          const newProgress = prev + 15 * Math.random();
          return newProgress > 100 ? 100 : newProgress;
        });

        setTimeout(() => {
          setCorrectOffsetProgress((prev) => {
            const newProgress = prev + 10 * Math.random();
            return newProgress > 100 ? 100 : newProgress;
          });
        }, 500);

        setTimeout(() => {
          setCorrectingCalibrationProgress((prev) => {
            const newProgress = prev + 5 * Math.random();
            return newProgress > 100 ? 100 : newProgress;
          });
        }, 1000);
      }, 200);

      // Run Python code
      const result = await window.ipcRenderer.invoke(
        "run-python-code",
        pythonCode
      );
      clearInterval(progressInterval);
      setTaskProgress(100);
      setSearchOffsetProgress(100);
      setCorrectOffsetProgress(100);
      setCorrectingCalibrationProgress(100);
      setTaskDescription(
        result.success
          ? "Python code executed successfully!"
          : "Python execution failed!"
      );
      setPythonResult(result);

      setTimeout(() => {
        completeTaskProgress();
        setRunningPython(false);
      }, 1000);
    } catch (error) {
      failTaskProgress();
      setRunningPython(false);
      setPythonResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Run a Python file
  const runPythonFile = async (filePath: string) => {
    try {
      setRunningPython(true);
      setPythonResult(null);
      startTaskProgress("Running Python File", `Executing ${filePath}...`);

      try {
        // Update progress during execution
        const progressInterval = setInterval(() => {
          setTaskProgress((prev) => {
            const newProgress = prev + 10 * Math.random();
            return newProgress > 90 ? 90 : newProgress;
          });
        }, 200);

        // Run Python file
        const result = await window.ipcRenderer.invoke(
          "run-python-file",
          filePath
        );
        clearInterval(progressInterval);
        setTaskProgress(100);
        setTaskDescription(
          result.success
            ? "Python file executed successfully!"
            : "Python file execution failed!"
        );
        setPythonResult(result);

        setTimeout(() => {
          completeTaskProgress();
          setRunningPython(false);
        }, 1000);
      } catch (error) {
        failTaskProgress();
        setRunningPython(false);
        setPythonResult({
          success: false,
          output: "",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } catch (error) {
      console.error("Error running Python file:", error);
      setErrorMessage("Failed to run Python file");
    }
  };

  // Run EXE command
  const runExeCommand = async () => {
    if (runningExe || !exeCommand) return;

    setRunningExe(true);
    setExeResult(null);
    startTaskProgress("Running Command", "Executing command...");

    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 10 * Math.random();
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Run EXE command
      const result = await window.ipcRenderer.invoke(
        "run-exe-command",
        exeCommand
      );
      clearInterval(progressInterval);
      setTaskProgress(100);
      setTaskDescription(
        result.success
          ? "Command executed successfully!"
          : "Command execution failed!"
      );
      setExeResult(result);

      setTimeout(() => {
        completeTaskProgress();
        setRunningExe(false);
      }, 1000);
    } catch (error) {
      failTaskProgress();
      setRunningExe(false);
      setExeResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Handle selecting a Python file to run
  const selectPythonFile = async () => {
    if (runningPython || !isPythonInstalled) return;

    const filePath = await window.ipcRenderer.invoke("open-file-dialog", {
      filters: [{ name: "Python Files", extensions: ["py"] }],
    });

    if (filePath) {
      runPythonFile(filePath);
    }
  };

  // Handle selecting an EXE file to run
  const selectExeFile = async () => {
    if (runningExe) return;

    const filePath = await window.ipcRenderer.invoke("open-file-dialog", {
      filters: [{ name: "Executable Files", extensions: ["exe"] }],
    });

    if (!filePath) return;

    setRunningExe(true);
    setExeResult(null);
    startTaskProgress("Running Executable", `Executing ${filePath}...`);

    try {
      // Update progress during execution
      const progressInterval = setInterval(() => {
        setTaskProgress((prev) => {
          const newProgress = prev + 10 * Math.random();
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 200);

      // Run EXE file
      const result = await window.ipcRenderer.invoke("run-exe-file", filePath);
      clearInterval(progressInterval);
      setTaskProgress(100);
      setTaskDescription(
        result.success
          ? "Executable file ran successfully!"
          : "Executable file execution failed!"
      );
      setExeResult(result);

      setTimeout(() => {
        completeTaskProgress();
        setRunningExe(false);
      }, 1000);
    } catch (error) {
      failTaskProgress();
      setRunningExe(false);
      setExeResult({
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Task progress management functions
  const startTaskProgress = (name: string, description: string) => {
    setTaskName(name);
    setTaskDescription(description);
    setTaskProgress(0);
    setIsTaskRunning(true);

    // Animate progress
    const interval = setInterval(() => {
      setTaskProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Store interval ID to clear it later
    return interval;
  };

  const completeTaskProgress = () => {
    setTaskProgress(100);
    setTimeout(() => {
      setIsTaskRunning(false);
    }, 1500);
  };

  const failTaskProgress = () => {
    setTaskProgress(100);
    setTaskDescription((prev) => `${prev} - Failed`);
    setTimeout(() => {
      setIsTaskRunning(false);
    }, 1500);
  };

  // Handle menu actions from the main process
  const handleMenuAction = useCallback(async (event: any, data: { action: string; path?: string }) => {
    console.log('Menu action received:', data.action)
    
    // Log the menu action
    try {
      await window.ipcRenderer?.invoke('log-event', `Menu action: ${data.action}`, 'info')
      await window.ipcRenderer?.invoke('log-data', {
        event: 'menu_action',
        action: data.action,
        path: data.path || ''
      })
    } catch (error) {
      console.error('Error logging menu action:', error)
    }
    
    // Set message to display in UI
    setMenuActionMessage(`Menu action: ${data.action}${data.path ? ` - Path: ${data.path}` : ''}`);
    
    // Handle specific actions
    switch (data.action) {
      case 'open-folder':
        if (data.path) {
          setFolderPath(data.path);
          setCurrentFolder(data.path);
          await loadFolderContents(data.path);
        }
        break;
        
      case 'open-file':
        if (data.path) {
          setSelectedFilePath(data.path);
          const ext = data.path.toLowerCase().split('.').pop();
          if (ext === 'py') {
            runPythonFile(data.path);
          } else if (ext === 'exe') {
            selectExeFile();
          } else {
            openNotepad(data.path);
          }
        }
        break;
        
      case 'export-log':
        // Show message that logs are exported
        setMenuActionMessage('Application logs have been exported');
        break;
        
      case 'run-python':
        selectPythonFile();
        break;
        
      case 'run-exe':
        selectExeFile();
        break;
        
      case 'calibration-wizard':
      case 'batch-processing':
      case 'check-updates':
        setMenuActionMessage(`Feature not yet implemented: ${data.action}`);
        break;
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setMenuActionMessage(null), 5000);
  }, [loadFolderContents, openNotepad, runPythonFile, selectExeFile, selectPythonFile]);
  
  // Register menu action listener
  useEffect(() => {
    // Add event listener for menu actions
    if (window.ipcRenderer) {
      window.ipcRenderer.on('menu-action', handleMenuAction);
    }
    
    // Cleanup: remove event listener when component unmounts
    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.off('menu-action', handleMenuAction);
      }
    };
  }, [handleMenuAction]);
  
  return (
    <div className="container">
      <div className="min-h-screen bg-background">
        <DroneImageAnalysisTool />
        {menuActionMessage && (
          <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-md shadow-lg">
            {menuActionMessage}
          </div>
        )}
      </div>
      <div className="header">
        <h1>
          {configData?.AppSettings?.Title || "Eye Camera Calibration Tool"}
        </h1>
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
    </div>
  );
}

export default App;
