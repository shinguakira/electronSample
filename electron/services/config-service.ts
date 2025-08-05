import path from "node:path";
import { existsSync } from "node:fs";
import * as ini from "ini";
import { FileService } from "./file-service";

/**
 * Configuration service for loading and managing INI configuration files
 */
export class ConfigService {
  /**
   * Load INI configuration file
   * @returns Configuration object
   */
  static async loadIniFile(): Promise<any> {
    const configPath = path.join(process.env.APP_ROOT as string, "config.ini");

    try {
      if (existsSync(configPath)) {
        const configContent = await FileService.readTextFile(configPath);
        const config = ini.parse(configContent);
        console.log("Configuration loaded:", config);
        return config;
      } else {
        console.log("Config file not found, using default configuration");
        const defaultConfig = {
          App: {
            Title: "Electron File Explorer",
            Version: "1.0.0",
            DefaultFolderPath:
              process.platform === "win32" ? "C:\\Users" : "/home",
          },
          Theme: {
            PrimaryColor: "",
            SecondaryColor: "",
            TextColor: "",
            BackgroundColor: "",
          },
          Features: {
            ShowHiddenFiles: false,
            OpenLastFolder: true,
            MaximizeOnStartup: false,
          },
        };

        // Create default config file
        await ConfigService.saveIniFile(defaultConfig);
        return defaultConfig;
      }
    } catch (error) {
      console.error("Error loading config file:", error);
      throw error;
    }
  }

  /**
   * Save configuration to INI file
   * @param config Configuration object to save
   */
  static async saveIniFile(config: any): Promise<void> {
    const configPath = path.join(process.env.APP_ROOT as string, "config.ini");

    try {
      const configContent = ini.stringify(config);
      await FileService.writeTextFile(configPath, configContent);
      console.log("Configuration saved to:", configPath);
    } catch (error) {
      console.error("Error saving config file:", error);
      throw error;
    }
  }

  /**
   * Get configuration value by key path
   * @param config Configuration object
   * @param keyPath Dot-separated key path (e.g., 'App.Title')
   * @returns Configuration value
   */
  static getConfigValue(config: any, keyPath: string): any {
    const keys = keyPath.split(".");
    let value = config;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set configuration value by key path
   * @param config Configuration object
   * @param keyPath Dot-separated key path (e.g., 'App.Title')
   * @param value Value to set
   */
  static setConfigValue(config: any, keyPath: string, value: any): void {
    const keys = keyPath.split(".");
    const lastKey = keys.pop();

    if (!lastKey) return;

    let current = config;
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }
}
