import { getAccessToken } from "./firebaseAuth";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Log levels to categorize the severity of log messages
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Interface for log data structure
 */
interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Send a log message to the server
 * @param level - The log level (DEBUG, INFO, WARN, ERROR)
 * @param message - The log message to send
 * @param metadata - Optional additional data to include with the log
 * @returns Promise that resolves when the log is sent
 */
export const sendLog = async (level: LogLevel, message: string, metadata?: Record<string, any>): Promise<boolean> => {
  try {
    // Get the current user's token if they're authenticated
    const token = await getAccessToken();

    // Get platform information
    const platform = Capacitor.getPlatform();
    
    // Get app version
    const appInfo = await App.getInfo();

    // Prepare the log data
    const logData: LogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        platform,
        app_version: appInfo.version,
        ...(metadata || {}),
      },
    };

    console.log("Sending log to server:", JSON.stringify(logData), `${process.env.REACT_APP_SERVER}/v5/mobile/log`);

    // Send the log to the server
    const response = await fetch(`${process.env.REACT_APP_SERVER}/v5/mobile/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(logData),
    });

    return response.ok;
  } catch (error) {
    // Log locally if we can't send to server
    console.error("Failed to send log to server:", error);
    return false;
  }
};

/**
 * Helper functions for different log levels
 */

/**
 * Send a DEBUG level log to the server
 */
export const logDebug = (message: string, metadata?: Record<string, any>) => sendLog(LogLevel.DEBUG, message, metadata);

/**
 * Send an INFO level log to the server
 */
export const logInfo = (message: string, metadata?: Record<string, any>) => sendLog(LogLevel.INFO, message, metadata);

/**
 * Send a WARN level log to the server
 */
export const logWarn = (message: string, metadata?: Record<string, any>) => sendLog(LogLevel.WARN, message, metadata);

/**
 * Send an ERROR level log to the server
 */
export const logError = (message: string, metadata?: Record<string, any>) => sendLog(LogLevel.ERROR, message, metadata);
