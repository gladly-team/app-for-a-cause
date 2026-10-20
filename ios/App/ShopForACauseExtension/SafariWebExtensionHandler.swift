//
//  SafariWebExtensionHandler.swift
//  ShopForACauseExtension
//
//  Bridge between the Wildfire Shop for a Cause Safari extension (JavaScript)
//  and the native app. The extension can't read the app's login, so the app
//  writes its settings to a shared App Group and this handler reads them back.
//

import SafariServices
import UIKit
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    // Shared with the App target. Must match ShopExtensionPlugin.swift and both entitlements files.
    let userDefaultsSuite = "group.io.gladly.appforacause.shop"

    // Empty string tells the extension the user is logged out. Wildfire's template
    // shipped a placeholder ID here, which would attribute purchases to a fake user.
    let defaultUserID = ""

    /*
     * Handles a message sent from the extension via browser.runtime.sendNativeMessage.
     *
     * Messages look like { type: "GET_USER_ID", payload: "" }. Each type reads one
     * value from the shared App Group (written by ShopExtensionPlugin in the app) and
     * returns it to the extension as { res: <value> }. COPY puts the payload on the
     * clipboard (used for coupon codes). Unknown types still complete the request so
     * the extension isn't left waiting.
     */
    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", String(describing: message))

        guard let response = message as? [String : AnyObject] else {
            return
        }
        guard let type = response["type"] as? String else {
            return
        }
        guard let payload = response["payload"] as? String else {
            return
        }
        guard let userDefaults = UserDefaults.init(suiteName: userDefaultsSuite) else {
            return
        }

        let res = NSExtensionItem()

        switch type {
            case "COPY":
                let itemToCopy = [payload]
                let pasteboard = UIPasteboard.general
                pasteboard.strings = itemToCopy
                res.userInfo = [ SFExtensionMessageKey: [ "res": true ] ]
            case "GET_USER_ID":
                let userID = userDefaults.string(forKey: "USER_ID") ?? defaultUserID
                res.userInfo = [ SFExtensionMessageKey: [ "res": userID ] ]
            case "GET_LAST_LINK_TIMESTAMP":
                let lastKnownNativeLinkTimeStamp = userDefaults.integer(forKey: "lastKnownNativeLinkTimeStamp")
                res.userInfo = [ SFExtensionMessageKey: [ "res": lastKnownNativeLinkTimeStamp ] ]
            case "IS_EXTENSION_ENABLED":
                let isExtensionEnabled = userDefaults.bool(forKey: "IS_EXTENSION_ENABLED")
                res.userInfo = [ SFExtensionMessageKey: [ "res": isExtensionEnabled ] ]
            case "IS_COUPON_ENABLED":
                let isCouponEnabled = userDefaults.bool(forKey: "IS_COUPON_ENABLED")
                res.userInfo = [ SFExtensionMessageKey: [ "res": isCouponEnabled ] ]
            case "GET_SPLIT_AMOUNT":
                // 0 when unset. The extension treats 0 as 1 (the user gets the full amount).
                let splitAmount = userDefaults.float(forKey: "SPLIT_AMOUNT")
                res.userInfo = [ SFExtensionMessageKey: [ "res": splitAmount ] ]
            default:
                os_log(.default, "Unknown message type from extension: %@", type)
        }
        context.completeRequest(returningItems: [res], completionHandler: nil)
    }
}
