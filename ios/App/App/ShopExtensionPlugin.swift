import Foundation
import Capacitor
import SafariServices
import UIKit

/*
 * Local Capacitor plugin that shares settings with the Shop for a Cause Safari
 * extension. The extension runs in its own process and can't see the app's login,
 * so we write values into an App Group that both targets can read.
 * SafariWebExtensionHandler.swift in ShopForACauseExtension reads these keys.
 *
 * Also powers the "turn on the extension" sheet: reports whether the extension is
 * enabled, opens Settings straight to it, and opens links in Safari.
 *
 * Registered in MainViewController. JS side lives in src/services/shopExtension.ts.
 */
@objc(ShopExtensionPlugin)
public class ShopExtensionPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ShopExtensionPlugin"
    public let jsName = "ShopExtension"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setConfig", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStatus", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openInSafari", returnType: CAPPluginReturnPromise)
    ]

    // Shared with the extension target. Must match SafariWebExtensionHandler.swift and both entitlements files.
    static let appGroup = "group.io.gladly.appforacause.shop"

    // Bundle ID of the embedded Safari extension (ShopForACauseExtension target).
    static let extensionIdentifier = "io.gladly.appforacause.ShopForACauseExtension"

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

    /*
     * Reports whether the user has turned the extension on in Safari.
     *
     * Resolves with:
     *   enabled          true if the extension is on.
     *   canOpenSettings  true if openSettings can jump straight to the extension (iOS 26.2+).
     *   osMajorVersion   iOS major version, so the JS side can pick the right instructions.
     *
     * On iOS 26.2+ Safari tells us directly. On older versions we can only tell that the
     * extension has run at least once (SafariWebExtensionHandler records EXTENSION_LAST_SEEN
     * whenever the extension talks to the app), so a freshly enabled extension reads as
     * off until the user visits a website.
     */
    @objc func getStatus(_ call: CAPPluginCall) {
        let osMajorVersion = ProcessInfo.processInfo.operatingSystemVersion.majorVersion

        if #available(iOS 26.2, *) {
            SFSafariExtensionManager.getStateOfExtension(withIdentifier: ShopExtensionPlugin.extensionIdentifier) { state, error in
                call.resolve([
                    "enabled": state?.isEnabled ?? self.hasExtensionRun(),
                    "canOpenSettings": true,
                    "osMajorVersion": osMajorVersion
                ])
            }
            return
        }

        call.resolve([
            "enabled": hasExtensionRun(),
            "canOpenSettings": false,
            "osMajorVersion": osMajorVersion
        ])
    }

    /*
     * Opens Settings. On iOS 26.2+ it lands on the Shop for a Cause extension page,
     * where the user flips one switch. Older versions can only open this app's own
     * settings page, so the sheet shows step-by-step directions from there.
     *
     * Resolves with { direct: true } when Settings opened on the extension itself.
     */
    @objc func openSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if #available(iOS 26.2, *) {
                SFSafariSettings.openExtensionsSettings(forIdentifiers: [ShopExtensionPlugin.extensionIdentifier]) { error in
                    if error == nil {
                        call.resolve(["direct": true])
                    } else {
                        self.openAppSettings(call)
                    }
                }
                return
            }
            self.openAppSettings(call)
        }
    }

    /*
     * Opens a URL in the Safari app. Safari extensions don't run inside the in-app
     * browser (SFSafariViewController), so "try it" links must go to real Safari.
     */
    @objc func openInSafari(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("A valid url is required")
            return
        }
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { opened in
                call.resolve(["opened": opened])
            }
        }
    }

    /*
     * Fallback for openSettings: opens this app's page in the Settings app.
     */
    private func openAppSettings(_ call: CAPPluginCall) {
        guard let url = URL(string: UIApplication.openSettingsURLString) else {
            call.reject("Unable to build the Settings URL")
            return
        }
        UIApplication.shared.open(url, options: [:]) { _ in
            call.resolve(["direct": false])
        }
    }

    /*
     * True once the extension has talked to the app at least once, which only
     * happens while it's enabled in Safari.
     */
    private func hasExtensionRun() -> Bool {
        let defaults = UserDefaults(suiteName: ShopExtensionPlugin.appGroup)
        return defaults?.object(forKey: "EXTENSION_LAST_SEEN") != nil
    }
}
