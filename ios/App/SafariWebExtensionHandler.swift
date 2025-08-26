//
//  SafariWebExtensionHandler.swift
//  iOS (Extension)
//

import SafariServices
import os.log

@available(iOS 15.0, *)
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    let userDefaultsSuite = "group.com.wildfire-corp.extensionLaunchpad"
    let defaultUserID = "MSE-Template-User-ID"
    
    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)
//        Message should follow format of:
//        {
//          type: "Message type",
//          payload: "Message Payload"
//        }
//        In the future we may want to parse the payload differently, but for now it is a string
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
                let splitAmount = userDefaults.float(forKey: "SPLIT_AMOUNT")
                res.userInfo = [ SFExtensionMessageKey: [ "res": splitAmount ] ]
            default:
                print("did not meet any case from switch statement")
        }
        context.completeRequest(returningItems: [res], completionHandler: nil)
    }
}