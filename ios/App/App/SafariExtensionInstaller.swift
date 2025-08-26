import Foundation
import Capacitor
import SafariServices

/**
 * Capacitor plugin to handle Safari extension installation
 */
@objc(SafariExtensionInstaller)
public class SafariExtensionInstaller: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SafariExtensionInstaller"
    public let jsName = "SafariExtensionInstaller"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "openExtensionPreferences", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "checkExtensionEnabled", returnType: CAPPluginReturnPromise)
    ]
    
    /**
     * Opens Safari extension preferences for the Shop for a Cause extension
     */
    @objc func openExtensionPreferences(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            // The extension bundle identifier should match your Safari extension
            // You'll need to update this with your actual extension bundle identifier
            let extensionBundleIdentifier = "com.wildfire-corp.Shop-for-a-Cause.Shop-for-a-Cause"
            
            if #available(iOS 14.0, *) {
                SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
                    if let error = error {
                        call.reject("Failed to open Safari extension preferences: \(error.localizedDescription)")
                    } else {
                        call.resolve([
                            "success": true,
                            "message": "Safari extension preferences opened"
                        ])
                    }
                }
            } else {
                call.reject("Safari extensions require iOS 14.0 or later")
            }
        }
    }
    
    /**
     * Checks if the Safari extension is currently enabled
     */
    @objc func checkExtensionEnabled(_ call: CAPPluginCall) {
        let extensionBundleIdentifier = "com.wildfire-corp.Shop-for-a-Cause.Shop-for-a-Cause"
        
        if #available(iOS 14.0, *) {
            SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { state, error in
                if let error = error {
                    call.reject("Failed to check extension state: \(error.localizedDescription)")
                } else if let state = state {
                    call.resolve([
                        "enabled": state.isEnabled,
                        "bundleIdentifier": extensionBundleIdentifier
                    ])
                } else {
                    call.reject("Could not determine extension state")
                }
            }
        } else {
            call.reject("Safari extensions require iOS 14.0 or later")
        }
    }
}