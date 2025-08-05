import path from "node:path";
import { existsSync, createWriteStream, mkdirSync } from "node:fs";

/**
 * Logger utility for text logs and CSV data
 */
export class LoggingService {
  private logFilePath: string;
  private csvFilePath: string;
  private csvStream: any;
  private csvHeaderWritten: boolean = false;

  constructor() {
    const logsDir = path.join(process.env.APP_ROOT as string, "logs");

    // Create logs directory if it doesn't exist
    if (!existsSync(logsDir)) {
      try {
        mkdirSync(logsDir, { recursive: true });
        console.log("Logs directory created:", logsDir);
      } catch (error) {
        console.error("Error creating logs directory:", error);
      }
    }

    this.logFilePath = path.join(logsDir, "app.log");
    this.csvFilePath = path.join(logsDir, "data.csv");

    // Initialize CSV stream
    if (!existsSync(this.csvFilePath)) {
      this.csvStream = createWriteStream(this.csvFilePath, { flags: "a" });
      this.csvHeaderWritten = true;
    }
  }

  log(message: string, level: "info" | "warn" | "error" = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    console.log(logEntry.trim());

    // Write to file (append mode)
    const fs = require("fs");
    fs.appendFileSync(this.logFilePath, logEntry);
  }

  logToCSV(data: Record<string, any>) {
    if (!this.csvStream) {
      this.csvStream = createWriteStream(this.csvFilePath, { flags: "a" });
    }

    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    // Write header if this is the first entry
    if (!this.csvHeaderWritten) {
      const headers = Object.keys(data).join(",") + "\n";
      this.csvStream.write(headers);
      this.csvHeaderWritten = true;
    }

    // Write data row
    const values =
      Object.values(data)
        .map((value) => {
          // Escape commas and quotes in CSV values
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(",") + "\n";

    this.csvStream.write(values);
  }

  close() {
    if (this.csvStream) {
      this.csvStream.end();
    }
  }
}
