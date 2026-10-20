import Foundation
import Capacitor

/*
 * Local Capacitor plugin that shares settings with the Shop for a Cause Safari
 * extension. The extension runs in its own process and can't see the app's login,
 * so we write values into an App Group that both targets can read.
 * SafariWebExtensionHandler.swift in ShopForACauseExtension reads these keys.
 *
 * Registered in MainViewController. JS side lives in src/services/shopExtension.ts.
 */
@objc(ShopExtensionPlugin)
public class ShopExtensionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ShopExtensionPlugin"
    public let jsName = "ShopExtension"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setConfig", returnType: CAPPluginReturnPromise)
    ]

    // Shared with the extension target. Must match SafariWebExtensionHandler.swift and both entitlements files.
    static let appGroup = "group.io.gladly.appforacause.shop"

    /*
     * Writes the extension's settings to the shared App Group.
     *
     * Options:
     *   userId           Gladly user ID, used by Wildfire as the purchase tracking code.
     *                    Pass "" on logout so the extension goes back to logged out.
     *   extensionEnabled Master on/off switch for the extension. Defaults to true.
     *   couponsEnabled   Turns Wildfire's coupon feature on or off. Defaults to true.
     *
     * Rejects if the App Group can't be opened, which means the entitlement is missing.
     */
    @objc func setConfig(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: ShopExtensionPlugin.appGroup) else {
            call.reject("Unable to open App Group \(ShopExtensionPlugin.appGroup)")
            return
        }

        let userId = call.getString("userId") ?? ""
        if userId.isEmpty {
            defaults.removeObject(forKey: "USER_ID")
        } else {
            defaults.set(userId, forKey: "USER_ID")
        }

        defaults.set(call.getBool("extensionEnabled") ?? true, forKey: "IS_EXTENSION_ENABLED")
        defaults.set(call.getBool("couponsEnabled") ?? true, forKey: "IS_COUPON_ENABLED")

        call.resolve()
    }
}
