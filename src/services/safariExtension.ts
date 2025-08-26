import { registerPlugin } from "@capacitor/core";
import { Capacitor } from "@capacitor/core";

/**
 * Interface for Safari Extension Installer plugin
 */
export interface SafariExtensionInstallerPlugin {
  /**
   * Opens the Safari extension preferences/settings page
   * where users can enable the extension
   */
  openExtensionPreferences(): Promise<{ success: boolean; message: string }>;

  /**
   * Checks if the Safari extension is currently enabled
   */
  checkExtensionEnabled(): Promise<{ enabled: boolean; bundleIdentifier: string }>;
}

// Register the plugin
const SafariExtensionInstaller = registerPlugin<SafariExtensionInstallerPlugin>("SafariExtensionInstaller", {
  web: () => {
    // Web implementation (fallback)
    return {
      openExtensionPreferences: async () => {
        console.warn("Safari extension installation is only available on iOS");
        return { success: false, message: "Not available on web" };
      },
      checkExtensionEnabled: async () => {
        console.warn("Safari extension check is only available on iOS");
        return { enabled: false, bundleIdentifier: "" };
      },
    };
  },
});

/**
 * Service class to handle Safari extension installation
 */
export class SafariExtensionService {
  /**
   * Triggers the Safari extension installation flow
   * Only works on iOS devices
   */
  static async installExtension(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      console.warn("Safari extension installation is only available on iOS");
      return false;
    }

    try {
      const result = await SafariExtensionInstaller.openExtensionPreferences();
      return result.success;
    } catch (error) {
      console.error("Error opening Safari extension preferences:", error);
      return false;
    }
  }

  /**
   * Checks if the Safari extension is enabled
   */
  static async isExtensionEnabled(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "ios") {
      return false;
    }

    try {
      const result = await SafariExtensionInstaller.checkExtensionEnabled();
      return result.enabled;
    } catch (error) {
      console.error("Error checking Safari extension state:", error);
      return false;
    }
  }

  /**
   * Handles postMessage request from iframe to install extension
   */
  static handleIframeMessage(event: MessageEvent): void {
    if (event.data?.action === "install-safari-extension") {
      this.installExtension().then((success) => {
        // Send response back to iframe if needed
        if (event.source && typeof event.source.postMessage === "function") {
          (event.source as Window).postMessage(
            {
              action: "safari-extension-install-response",
              success: success,
            },
            "*"
          );
        }
      });
    }
  }
}

export default SafariExtensionInstaller;