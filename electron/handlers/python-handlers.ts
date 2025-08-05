import { ipcMain } from "electron";
import { ProcessService } from "../services";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import fs from "node:fs/promises";
import { tmpdir } from "os";

/**
 * Register all Python-related IPC handlers
 */
export function registerPythonHandlers() {
  // Check if Python is installed
  ipcMain.handle("check-python-installed", async () => {
    try {
      const result = await ProcessService.execPromise("python --version");
      console.log(`Python version: ${result.stdout || result.stderr}`);
      return true;
    } catch (error) {
      console.error(`Error checking Python: ${error}`);
      return false;
    }
  });

  // Run Python code
  ipcMain.handle("run-python-code", async (_, code: string) => {
    try {
      // Create a temporary file with the Python code
      const tempFileName = `temp_${uuidv4()}.py`;
      const tempFilePath = path.join(tmpdir(), tempFileName);

      // Write the code to the temporary file
      await fs.writeFile(tempFilePath, code, "utf8");

      // Execute the Python script
      const result = await ProcessService.executePythonScript(tempFilePath);

      // Clean up the temporary file
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary file:", cleanupError);
      }

      return result;
    } catch (error) {
      console.error("Error running Python code:", error);
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // Run Python script from file
  ipcMain.handle("run-python-script", async (_, scriptPath: string) => {
    try {
      return await ProcessService.executePythonScript(scriptPath);
    } catch (error) {
      console.error("Error running Python script:", error);
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  // Execute EXE file
  ipcMain.handle(
    "execute-exe",
    async (_, { exePath, args }: { exePath: string; args?: string[] }) => {
      try {
        return await ProcessService.executeExeFile(exePath, args || []);
      } catch (error) {
        console.error("Error executing EXE file:", error);
        return {
          success: false,
          output: "",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );
}
