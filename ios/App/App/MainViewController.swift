import UIKit
import Capacitor

/*
 * Root view controller for the app (set in Main.storyboard). Subclasses Capacitor's
 * bridge so we can register plugins that live in this project instead of npm.
 */
class MainViewController: CAPBridgeViewController {
    /*
     * Called once the Capacitor bridge is ready. Registers local plugins so the
     * web app can call them through registerPlugin() on the JS side.
     */
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(ShopExtensionPlugin())
    }
}
