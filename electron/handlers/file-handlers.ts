import { ipcMain } from "electron";
import { FileService } from "../services";

/**
 * Register all file-related IPC handlers
 */
export function registerFileHandlers() {
  // Read text file
  ipcMain.handle("read-text-file", async (_, filePath: string) => {
    try {
      return await FileService.readTextFile(filePath);
    } catch (error) {
      console.error("IPC read-text-file error:", error);
      throw error;
    }
  });

  // Write text file
  ipcMain.handle(
    "write-text-file",
    async (
      _,
      {
        filePath,
        content,
        append,
      }: { filePath: string; content: string; append?: boolean }
    ) => {
      try {
        return await FileService.writeTextFile(filePath, content, append);
      } catch (error) {
        console.error("IPC write-text-file error:", error);
        throw error;
      }
    }
  );

  // Read JSON file
  ipcMain.handle("read-json-file", async (_, filePath: string) => {
    try {
      return await FileService.readJsonFile(filePath);
    } catch (error) {
      console.error("IPC read-json-file error:", error);
      throw error;
    }
  });

  // Write JSON file
  ipcMain.handle(
    "write-json-file",
    async (
      _,
      {
        filePath,
        data,
        pretty,
      }: { filePath: string; data: any; pretty?: boolean }
    ) => {
      try {
        return await FileService.writeJsonFile(filePath, data, pretty);
      } catch (error) {
        console.error("IPC write-json-file error:", error);
        throw error;
      }
    }
  );

  // Read CSV file
  ipcMain.handle(
    "read-csv-file",
    async (
      _,
      { filePath, hasHeader }: { filePath: string; hasHeader?: boolean }
    ) => {
      try {
        return await FileService.readCsvFile(filePath, hasHeader);
      } catch (error) {
        console.error("IPC read-csv-file error:", error);
        throw error;
      }
    }
  );

  // Write CSV file
  ipcMain.handle(
    "write-csv-file",
    async (
      _,
      {
        filePath,
        data,
        headers,
      }: { filePath: string; data: any[]; headers?: string[] }
    ) => {
      try {
        return await FileService.writeCsvFile(filePath, data, headers);
      } catch (error) {
        console.error("IPC write-csv-file error:", error);
        throw error;
      }
    }
  );

  // Read binary file
  ipcMain.handle("read-binary-file", async (_, filePath: string) => {
    try {
      const buffer = await FileService.readBinaryFile(filePath);
      // Convert Buffer to ArrayBuffer for transfer to renderer
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
    } catch (error) {
      console.error("IPC read-binary-file error:", error);
      throw error;
    }
  });

  // Write binary file
  ipcMain.handle(
    "write-binary-file",
    async (_, { filePath, data }: { filePath: string; data: Uint8Array }) => {
      try {
        return await FileService.writeBinaryFile(filePath, Buffer.from(data));
      } catch (error) {
        console.error("IPC write-binary-file error:", error);
        throw error;
      }
    }
  );

  // Check if file exists
  ipcMain.handle("file-exists", async (_, filePath: string) => {
    try {
      return await FileService.fileExists(filePath);
    } catch (error) {
      console.error("IPC file-exists error:", error);
      throw error;
    }
  });

  // Get file stats
  ipcMain.handle("get-file-stats", async (_, filePath: string) => {
    try {
      const stats = await FileService.getFileStats(filePath);
      // Convert to plain object for IPC transfer
      return {
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
      };
    } catch (error) {
      console.error("IPC get-file-stats error:", error);
      throw error;
    }
  });

  // Ensure directory exists
  ipcMain.handle(
    "ensure-dir",
    async (
      _,
      { dirPath, recursive }: { dirPath: string; recursive?: boolean }
    ) => {
      try {
        return await FileService.ensureDir(dirPath, recursive);
      } catch (error) {
        console.error("IPC ensure-dir error:", error);
        throw error;
      }
    }
  );

  // Copy file
  ipcMain.handle(
    "copy-file",
    async (
      _,
      { sourcePath, destPath }: { sourcePath: string; destPath: string }
    ) => {
      try {
        return await FileService.copyFile(sourcePath, destPath);
      } catch (error) {
        console.error("IPC copy-file error:", error);
        throw error;
      }
    }
  );

  // Delete file
  ipcMain.handle("delete-file", async (_, filePath: string) => {
    try {
      return await FileService.deleteFile(filePath);
    } catch (error) {
      console.error("IPC delete-file error:", error);
      throw error;
    }
  });

  // Open Notepad
  ipcMain.handle("open-notepad", async (_, filePath = null) => {
    try {
      const { exec } = require("child_process");
      let command = "notepad.exe";
      if (filePath) {
        command += ` "${filePath}"`;
      }

      exec(command, (error: Error) => {
        if (error) {
          console.error("Error opening Notepad:", error);
          return false;
        }
      });
      return true;
    } catch (error) {
      console.error("Error opening Notepad:", error);
      return false;
    }
  });
}
