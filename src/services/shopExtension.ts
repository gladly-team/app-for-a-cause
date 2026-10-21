import { Capacitor, registerPlugin } from "@capacitor/core";
import { logError, logInfo } from "./logService";

/**
 * Settings shared with the Shop for a Cause Safari extension (iOS only).
 * Native side: ios/App/App/ShopExtensionPlugin.swift
 */
interface ShopExtensionConfig {
  userId: string;
  extensionEnabled?: boolean;
  couponsEnabled?: boolean;
}

/**
 * What the native side knows about the extension.
 */
interface NativeStatus {
  enabled: boolean;
  canOpenSettings: boolean;
  osMajorVersion: number;
}

/**
 * Status shared with the dashboard and settings web views so they can show or hide
 * the Shop for a Cause card and settings row.
 */
export interface ShopExtensionStatus {
  supported: boolean;
  enabled: boolean;
  canOpenSettings: boolean;
  osMajorVersion: number;
  promoDismissed: boolean;
}

interface ShopExtensionPlugin {
  setConfig(options: ShopExtensionConfig): Promise<void>;
  getStatus(): Promise<NativeStatus>;
  openSettings(): Promise<{ direct: boolean }>;
  openInSafari(options: { url: string }): Promise<{ opened: boolean }>;
}

const ShopExtension = registerPlugin<ShopExtensionPlugin>("ShopExtension");

// localStorage keys. These live in the app's own web view, not the tab-v5 iframes.
const PROMO_DISMISSED_KEY = "shop-extension-promo-dismissed";
const LAST_KNOWN_ENABLED_KEY = "shop-extension-last-known-enabled";

/**
 * True when this device can run the Safari extension (the iOS app only).
 */
export const isShopExtensionSupported = (): boolean => Capacitor.getPlatform() === "ios";

/**
 * Write settings to the App Group the Safari extension reads from. No-op off iOS.
 * Failures are logged, not thrown, so the extension never blocks login or logout.
 * @param config - The user ID plus optional feature flags
 */
const setConfig = async (config: ShopExtensionConfig): Promise<void> => {
  if (!isShopExtensionSupported()) {
    return;
  }

  try {
    await ShopExtension.setConfig(config);
  } catch (error) {
    logError("Failed to update Shop for a Cause extension config", { error: String(error) });
  }
};

/**
 * Log the extension in as this user. Wildfire uses the ID as the purchase
 * tracking code, which tab-v5 maps back to the user when commissions sync.
 * @param userId - Gladly user ID (the `id` from /v5/api/user)
 */
export const setShopExtensionUser = (userId: string): Promise<void> => setConfig({ userId });

/**
 * Log the extension out so it stops attributing purchases. Call on logout and account deletion.
 */
export const clearShopExtensionUser = (): Promise<void> => setConfig({ userId: "" });

/**
 * Read a localStorage flag, treating any storage error as "not set".
 * @param key - The localStorage key
 */
const readFlag = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

/**
 * Write a localStorage flag, ignoring storage errors.
 * @param key - The localStorage key
 * @param value - The value to store
 */
const writeFlag = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Storage unavailable. Worst case the card shows again next launch.
  }
};

/**
 * Current extension status. Off iOS (or if the native call fails) this reports
 * supported: false, which keeps the card and settings row hidden.
 *
 * Also logs the moment the extension flips from off to on, so we can measure
 * how many people the card and sheet convert.
 */
export const getShopExtensionStatus = async (): Promise<ShopExtensionStatus> => {
  const promoDismissed = readFlag(PROMO_DISMISSED_KEY);
  const unsupported = { supported: false, enabled: false, canOpenSettings: false, osMajorVersion: 0, promoDismissed };

  if (!isShopExtensionSupported()) {
    return unsupported;
  }

  try {
    const native = await ShopExtension.getStatus();

    if (native.enabled && !readFlag(LAST_KNOWN_ENABLED_KEY)) {
      logInfo("Shop for a Cause extension turned on");
    }
    writeFlag(LAST_KNOWN_ENABLED_KEY, native.enabled);

    return { supported: true, promoDismissed, ...native };
  } catch (error) {
    logError("Failed to read Shop for a Cause extension status", { error: String(error) });
    return unsupported;
  }
};

/**
 * Hide the dashboard card for good. The settings row still opens the sheet.
 */
export const dismissShopExtensionPromo = (): void => writeFlag(PROMO_DISMISSED_KEY, true);

/**
 * Open Settings, straight to the extension on iOS 26.2+.
 * @returns true if Settings opened directly on the extension
 */
export const openShopExtensionSettings = async (): Promise<boolean> => {
  try {
    const { direct } = await ShopExtension.openSettings();
    return direct;
  } catch (error) {
    logError("Failed to open Safari extension settings", { error: String(error) });
    return false;
  }
};

/**
 * Open a URL in the Safari app (not the in-app browser), where the extension runs.
 * @param url - The page to open
 */
export const openInSafari = async (url: string): Promise<void> => {
  try {
    await ShopExtension.openInSafari({ url });
  } catch (error) {
    logError("Failed to open URL in Safari", { url, error: String(error) });
  }
};
