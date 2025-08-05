import { spawn, exec } from "node:child_process";

export interface ProcessResult {
  success: boolean;
  output: string;
  error: string;
}

/**
 * Process execution service for running Python scripts and executables
 */
export class ProcessService {
  /**
   * Execute a Python script and return its output
   * @param scriptPath Path to the Python script
   * @returns Process execution result
   */
  static async executePythonScript(scriptPath: string): Promise<ProcessResult> {
    return new Promise<ProcessResult>((resolve) => {
      const pythonCommand = process.platform === "win32" ? "python" : "python3";
      const pythonProcess = spawn(pythonCommand, [scriptPath]);

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdoutData,
            error: "",
          });
        } else {
          resolve({
            success: false,
            output: stdoutData,
            error: stderrData || `Process exited with code ${code}`,
          });
        }
      });

      pythonProcess.on("error", (error) => {
        resolve({
          success: false,
          output: "",
          error: error.message,
        });
      });
    });
  }

  /**
   * Execute an executable file and return its output
   * @param exePath Path to the executable
   * @param args Arguments to pass to the executable
   * @returns Process execution result
   */
  static async executeExeFile(
    exePath: string,
    args: string[] = []
  ): Promise<ProcessResult> {
    return new Promise<ProcessResult>((resolve) => {
      // Make sure it's a valid executable
      if (!exePath.toLowerCase().endsWith(".exe")) {
        resolve({
          success: false,
          output: "",
          error: "Invalid executable file. Must be an .exe file.",
        });
        return;
      }

      // Execute the program
      const process = spawn(exePath, args);

      let stdoutData = "";
      let stderrData = "";

      process.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      process.stderr.on("data", (data) => {
        stderrData += data.toString();
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdoutData,
            error: "",
          });
        } else {
          resolve({
            success: false,
            output: stdoutData,
            error: stderrData || `Process exited with code ${code}`,
          });
        }
      });

      process.on("error", (error) => {
        resolve({
          success: false,
          output: "",
          error: error.message,
        });
      });
    });
  }

  /**
   * Promise wrapper for exec command
   * @param command Command to execute
   * @returns stdout and stderr output
   */
  static execPromise(
    command: string
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve({ stdout, stderr });
      });
    });
  }
}
