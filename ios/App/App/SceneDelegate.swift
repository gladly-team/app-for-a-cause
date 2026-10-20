import UIKit
import Capacitor
import FBSDKCoreKit
import BranchSDK

/*
 * Window scene delegate. Apps built with the iOS 27 SDK must use the scene
 * lifecycle, which moves URL and universal link delivery from AppDelegate to here.
 * The window and root view controller still come from Main.storyboard (set in
 * Info.plist under UIApplicationSceneManifest).
 */
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    /*
     * Called when the scene is created. If the app was cold launched from a link,
     * the link arrives here instead of openURLContexts / continue, so forward it.
     */
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        if let userActivity = connectionOptions.userActivities.first {
            handleUserActivity(userActivity, scene: scene)
        }
        if !connectionOptions.urlContexts.isEmpty {
            handleURLContexts(connectionOptions.urlContexts, scene: scene)
        }
    }

    /*
     * Custom URL schemes (Branch, Facebook, Capacitor) opened while the app is running.
     */
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        handleURLContexts(URLContexts, scene: scene)
    }

    /*
     * Universal links (applinks in App.entitlements) opened while the app is running.
     */
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        handleUserActivity(userActivity, scene: scene)
    }

    /*
     * Sends each opened URL to Branch, then Facebook, then Capacitor (which feeds
     * the App plugin's appUrlOpen event). Same order AppDelegate used before scenes.
     */
    private func handleURLContexts(_ URLContexts: Set<UIOpenURLContext>, scene: UIScene) {
        BranchScene.shared().scene(scene, openURLContexts: URLContexts)

        for context in URLContexts {
            let url = context.url
            let handledByFacebook = ApplicationDelegate.shared.application(
                UIApplication.shared,
                open: url,
                sourceApplication: context.options.sourceApplication,
                annotation: context.options.annotation
            )
            if handledByFacebook {
                continue
            }

            var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
            if let sourceApplication = context.options.sourceApplication {
                options[.sourceApplication] = sourceApplication
            }
            if let annotation = context.options.annotation {
                options[.annotation] = annotation
            }
            _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: options)
        }
    }

    /*
     * Sends a universal link to Branch and Capacitor.
     */
    private func handleUserActivity(_ userActivity: NSUserActivity, scene: UIScene) {
        BranchScene.shared().scene(scene, continue: userActivity)
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
