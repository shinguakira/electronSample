import fs from "node:fs/promises";

/**
 * File utility class for reading and writing various file formats
 */
export class FileService {
  /**
   * Read a text file
   * @param filePath Path to the text file
   * @returns Content of the file as string
   */
  static async readTextFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (error) {
      console.error(`Error reading text file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write a text file
   * @param filePath Path where to write the file
   * @param content Content to write
   * @param append Whether to append to existing file instead of overwriting
   * @returns true if successful
   */
  static async writeTextFile(
    filePath: string,
    content: string,
    append = false
  ): Promise<boolean> {
    try {
      await fs.writeFile(filePath, content, { flag: append ? "a" : "w" });
      return true;
    } catch (error) {
      console.error(`Error writing text file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Read a JSON file
   * @param filePath Path to the JSON file
   * @returns Parsed JSON object
   */
  static async readJsonFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading JSON file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write a JSON file
   * @param filePath Path where to write the file
   * @param data Object to serialize to JSON
   * @param pretty Whether to prettify the JSON output
   * @returns true if successful
   */
  static async writeJsonFile(
    filePath: string,
    data: any,
    pretty = true
  ): Promise<boolean> {
    try {
      const content = pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      await fs.writeFile(filePath, content, "utf8");
      return true;
    } catch (error) {
      console.error(`Error writing JSON file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Read a CSV file
   * @param filePath Path to the CSV file
   * @param hasHeader Whether the CSV has a header row
   * @returns Array of row objects if hasHeader is true, otherwise array of string arrays
   */
  static async readCsvFile(filePath: string, hasHeader = true): Promise<any[]> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const lines = content.split("\n").filter((line) => line.trim());

      if (lines.length === 0) return [];

      if (hasHeader) {
        const headers = lines[0].split(",").map((h) => h.trim());
        return lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || "";
          });
          return obj;
        });
      } else {
        return lines.map((line) => line.split(",").map((v) => v.trim()));
      }
    } catch (error) {
      console.error(`Error reading CSV file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write a CSV file
   * @param filePath Path where to write the file
   * @param data Array of objects or array of arrays
   * @param headers Optional headers (will be extracted from object keys if not provided)
   * @returns true if successful
   */
  static async writeCsvFile(
    filePath: string,
    data: any[],
    headers?: string[]
  ): Promise<boolean> {
    try {
      if (data.length === 0) {
        await fs.writeFile(filePath, "", "utf8");
        return true;
      }

      let csvContent = "";

      // Handle array of objects
      if (typeof data[0] === "object" && !Array.isArray(data[0])) {
        const csvHeaders = headers || Object.keys(data[0]);
        csvContent = csvHeaders.join(",") + "\n";

        for (const row of data) {
          const values = csvHeaders.map((header) => {
            const value = row[header];
            // Escape commas and quotes in values
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          });
          csvContent += values.join(",") + "\n";
        }
      }
      // Handle array of arrays
      else if (Array.isArray(data[0])) {
        if (headers) {
          csvContent = headers.join(",") + "\n";
        }

        for (const row of data) {
          const values = row.map((value: any) => {
            // Escape commas and quotes in values
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || "";
          });
          csvContent += values.join(",") + "\n";
        }
      }

      await fs.writeFile(filePath, csvContent, "utf8");
      return true;
    } catch (error) {
      console.error(`Error writing CSV file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Read a binary file
   * @param filePath Path to the binary file
   * @returns Buffer containing file data
   */
  static async readBinaryFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      console.error(`Error reading binary file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Write a binary file
   * @param filePath Path where to write the file
   * @param data Buffer or Uint8Array of data to write
   * @returns true if successful
   */
  static async writeBinaryFile(
    filePath: string,
    data: Buffer | Uint8Array
  ): Promise<boolean> {
    try {
      await fs.writeFile(filePath, data);
      return true;
    } catch (error) {
      console.error(`Error writing binary file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Check if a file exists
   * @param filePath Path to the file
   * @returns true if file exists
   */
  static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats (size, creation date, etc)
   * @param filePath Path to the file
   * @returns File stats object
   */
  static async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      console.error(`Error getting file stats for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Create directory if it doesn't exist
   * @param dirPath Path to the directory
   * @param recursive Whether to create parent directories if they don't exist
   * @returns true if successful
   */
  static async ensureDir(dirPath: string, recursive = true): Promise<boolean> {
    try {
      await fs.mkdir(dirPath, { recursive });
      return true;
    } catch (error) {
      console.error(`Error creating directory ${dirPath}:`, error);
      throw error;
    }
  }

  /**
   * Copy a file
   * @param sourcePath Source file path
   * @param destPath Destination file path
   * @returns true if successful
   */
  static async copyFile(
    sourcePath: string,
    destPath: string
  ): Promise<boolean> {
    try {
      await fs.copyFile(sourcePath, destPath);
      return true;
    } catch (error) {
      console.error(
        `Error copying file from ${sourcePath} to ${destPath}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete a file
   * @param filePath Path to the file to delete
   * @returns true if successful
   */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
    }
  }
}
