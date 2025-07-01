import { app as t, BrowserWindow as p, ipcMain as a, dialog as _ } from "electron";
import { fileURLToPath as w } from "node:url";
import e from "node:path";
import E from "node:fs/promises";
import { exec as R } from "node:child_process";
const d = e.dirname(w(import.meta.url));
process.env.APP_ROOT = e.join(d, "..");
const c = process.env.VITE_DEV_SERVER_URL, v = e.join(process.env.APP_ROOT, "dist-electron"), m = e.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = c ? e.join(process.env.APP_ROOT, "public") : m;
let n;
function f() {
  n = new p({
    icon: e.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: e.join(d, "preload.mjs")
    }
  }), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), c ? n.loadURL(c) : n.loadFile(e.join(m, "index.html"));
}
t.on("window-all-closed", () => {
  process.platform !== "darwin" && (t.quit(), n = null);
});
t.on("activate", () => {
  p.getAllWindows().length === 0 && f();
});
t.whenReady().then(() => {
  a.handle("open-folder-dialog", async () => (await _.showOpenDialog({
    properties: ["openDirectory"]
  })).filePaths[0]), a.handle("get-folder-contents", async (l, r) => {
    try {
      const o = await E.readdir(r, { withFileTypes: !0 });
      return await Promise.all(o.map(async (i) => {
        const u = e.join(r, i.name);
        return {
          name: i.name,
          isDirectory: i.isDirectory(),
          path: u
        };
      }));
    } catch (o) {
      return console.error("Error reading directory:", o), [];
    }
  }), a.handle("open-notepad", async (l, r = null) => {
    try {
      let o = "notepad.exe";
      return r && (o += ` "${r}"`), R(o, (s) => {
        if (s)
          return console.error("Error opening Notepad:", s), !1;
      }), !0;
    } catch (o) {
      return console.error("Error opening Notepad:", o), !1;
    }
  }), f();
});
export {
  v as MAIN_DIST,
  m as RENDERER_DIST,
  c as VITE_DEV_SERVER_URL
};
