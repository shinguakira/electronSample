import { app, BrowserWindow, Menu, protocol, net } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { buildApplicationMenu } from "./menu-builder";
import { registerAllHandlers } from "./handlers";
import { LoggingService, ConfigService } from "./services";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Define a variable to store our INI configuration
let configData: any = {};

// Make configData available globally for the session handlers
declare global {
  var configData: any;
}

// Set the global variable
global.configData = configData;

// Track application start time
const appStartTime = Date.now();

// Initialize logging service
const logger = new LoggingService();

let win: BrowserWindow | null;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    icon: path.join(process.env.VITE_PUBLIC!, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.on("ready-to-show", () => {
    win?.show();

    if (VITE_DEV_SERVER_URL) {
      win?.webContents.openDevTools();
    }
  });

  win.webContents.setWindowOpenHandler((details) => {
    require("electron").shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Set up the application menu
  const menu = buildApplicationMenu();
  Menu.setApplicationMenu(menu);

  // Test Vite HMR for renderer process
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // Log application exit
    logger.log("Application closing");
    logger.logToCSV({ event: "application_exit" });
    logger.close();

    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  // Load INI file when app starts
  configData = await ConfigService.loadIniFile();
  global.configData = configData;

  // Register custom protocol
  protocol.handle("app", (request: Request) => {
    return net.fetch("file://" + request.url.slice("app://".length));
  });

  // Create the main window
  createWindow();

  // Register all IPC handlers after window is created
  if (win) {
    registerAllHandlers(win, appStartTime);
  }

  // Log application start
  logger.log("Application started");
  logger.logToCSV({ event: "application_start" });
});
