import { Capacitor, registerPlugin } from "@capacitor/core";
import { logError } from "./logService";

/**
 * Settings shared with the Shop for a Cause Safari extension (iOS only).
 * Native side: ios/App/App/ShopExtensionPlugin.swift
 */
interface ShopExtensionConfig {
  userId: string;
  extensionEnabled?: boolean;
  couponsEnabled?: boolean;
}

interface ShopExtensionPlugin {
  setConfig(options: ShopExtensionConfig): Promise<void>;
}

const ShopExtension = registerPlugin<ShopExtensionPlugin>("ShopExtension");

/**
 * Write settings to the App Group the Safari extension reads from. No-op off iOS.
 * Failures are logged, not thrown, so the extension never blocks login or logout.
 * @param config - The user ID plus optional feature flags
 */
const setConfig = async (config: ShopExtensionConfig): Promise<void> => {
  if (Capacitor.getPlatform() !== "ios") {
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
