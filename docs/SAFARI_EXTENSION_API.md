# Safari Extension Installation API Documentation

## Overview
This document describes the API for triggering Safari extension installation from within an iframe embedded in the Ionic mobile app.

## Prerequisites
- iOS 14.0 or later
- Safari extension must be bundled with the app
- User must be running the app on an iOS device (not simulator)

## API Methods

### 1. Install Safari Extension

Triggers the Safari extension installation flow by opening the iOS Settings app where users can enable the extension.

**PostMessage Request:**
```javascript
window.parent.postMessage({
  action: "install-safari-extension"
}, "*");
```

**Response:**
```javascript
// Listen for response
window.addEventListener("message", (event) => {
  if (event.data.action === "safari-extension-install-response") {
    console.log("Installation triggered:", event.data.success);
    // success: boolean - true if settings opened, false if failed
  }
});
```

### 2. Check Extension Status

Checks if the Safari extension is currently enabled.

**PostMessage Request:**
```javascript
window.parent.postMessage({
  action: "check-safari-extension"
}, "*");
```

**Response:**
```javascript
// Listen for response
window.addEventListener("message", (event) => {
  if (event.data.action === "safari-extension-status-response") {
    console.log("Extension enabled:", event.data.enabled);
    // enabled: boolean - true if extension is enabled, false if disabled
  }
});
```

## Example Implementation (Iframe Side)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Safari Extension Example</title>
</head>
<body>
  <button id="installBtn">Install Safari Extension</button>
  <button id="checkBtn">Check Extension Status</button>
  <div id="status"></div>

  <script>
    // Setup message listener
    window.addEventListener("message", (event) => {
      if (event.data.action === "safari-extension-install-response") {
        document.getElementById("status").textContent = 
          event.data.success ? "Settings opened successfully" : "Failed to open settings";
      } else if (event.data.action === "safari-extension-status-response") {
        document.getElementById("status").textContent = 
          "Extension is " + (event.data.enabled ? "enabled" : "disabled");
      }
    });

    // Install button handler
    document.getElementById("installBtn").addEventListener("click", () => {
      window.parent.postMessage({
        action: "install-safari-extension"
      }, "*");
    });

    // Check status button handler
    document.getElementById("checkBtn").addEventListener("click", () => {
      window.parent.postMessage({
        action: "check-safari-extension"
      }, "*");
    });
  </script>
</body>
</html>
```

## Testing

### Using the Test Component
A test component is available in the app for development testing:
1. The `SafariExtensionTest` component will appear at the top of the Dashboard
2. Use the buttons to test both direct API calls and simulated iframe messages
3. The component shows the current platform and extension status

### Testing Without the Iframe
You can test the functionality using the browser console:
```javascript
// Simulate install message
window.postMessage({ action: "install-safari-extension" }, "*");

// Simulate check status message
window.postMessage({ action: "check-safari-extension" }, "*");
```

## Important Notes

1. **iOS Only**: This functionality only works on iOS devices. Attempting to use it on Android or web will return failure responses.

2. **User Action Required**: The extension installation requires user interaction. The app can only open the Settings page; users must manually toggle the extension on.

3. **Extension Bundle ID**: The extension bundle identifier is hardcoded in `SafariExtensionInstaller.swift`. Update it if your extension ID changes:
   ```swift
   let extensionBundleIdentifier = "com.wildfire-corp.Shop-for-a-Cause.Shop-for-a-Cause"
   ```

4. **Testing on Device**: Safari extensions cannot be tested in the iOS Simulator. You must test on a real device.

## Files Modified

1. **Native iOS (Swift)**:
   - `/ios/App/App/SafariExtensionInstaller.swift` - Native plugin implementation

2. **TypeScript/JavaScript**:
   - `/src/services/safariExtension.ts` - Capacitor plugin wrapper and service
   - `/src/components/Dashboard.tsx` - Message handler integration
   - `/src/components/SafariExtensionTest.tsx` - Test component (remove in production)

3. **Documentation**:
   - `/docs/SAFARI_EXTENSION_API.md` - This file

## Next Steps for Production

1. Remove or hide the `SafariExtensionTest` component from Dashboard
2. Update the extension bundle identifier in `SafariExtensionInstaller.swift` if needed
3. Add the Swift file to Xcode project's compile sources
4. Test the complete flow with your actual iframe implementation
5. Consider adding analytics tracking for extension installation attempts