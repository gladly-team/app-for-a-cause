# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

App for a Cause is a mobile application built with Ionic, React, and Capacitor. It's a cross-platform mobile app that allows users to contribute to causes by using the app and viewing ads. The app uses Firebase for authentication and OneSignal for push notifications.

## Environment Setup and Commands

### Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build the project
npm run build

# Run tests
npm test

# Lint the codebase
npm run lint

# Generate splash screens and icons from assets/icon.png and assets/splash.png
npx capacitor-assets generate

# Sync web code to native platforms
npx cap sync
```

### Mobile Platform Commands

```bash
# Run on iOS
npx cap open ios

# Run on Android
npx cap open android

# Build and copy to iOS
npm run build && npx cap copy ios

# Build and copy to Android
npm run build && npx cap copy android
```

## Architecture Overview

The application is structured as a typical Ionic React application:

1. **Authentication Flow**:
   - Firebase Authentication for Google, Facebook, and Apple Sign-in
   - Email verification process
   - User account creation and management

2. **User Onboarding Flow**:
   - User sign-in through Auth component
   - Cause selection through SelectCause component
   - Username setting through SetUsername component
   - Email verification through EmailVerification component

3. **Main Application**:
   - Dashboard showing user stats and ads
   - Games page for interactive content
   - Leaderboard showing top contributors

4. **Key Services**:
   - `firebaseAuth.ts`: Manages Firebase authentication
   - `logService.ts`: Handles application logging
   - `url.ts`: Manages URL generation and handling

## Important Notes

1. **Firebase Authentication**:
   - The app uses Google, Facebook, and Apple sign-in methods
   - For Facebook Auth, there's a library patch required as noted in README

2. **Splash Screens and Icons**:
   - Update source files in `assets/icon.png` and `assets/splash.png`
   - Run `npx capacitor-assets generate` to build all required image sizes

3. **OneSignal Integration**:
   - The app uses OneSignal for push notifications
   - Notification handling is set up in App.tsx

4. **Capacitor Configuration**:
   - Configuration is in `capacitor.config.ts`
   - Platform-specific settings for Android and iOS

5. **Mobile-Web Communication**:
   - The app embeds web content and communicates via postMessage
   - Authentication tokens are passed to the web views

## Version Management

When releasing a new version of the app, update the following version numbers:

### 1. Package Version
**File:** `package.json`
- Update the `version` field (e.g., "1.0.12" → "1.0.13")

### 2. iOS Versions
**File:** `ios/App/App.xcodeproj/project.pbxproj`
- Update all instances of `CURRENT_PROJECT_VERSION` (build number, e.g., 2 → 3)
- Update all instances of `MARKETING_VERSION` (version string, e.g., "1.0.12" → "1.0.13")
- Note: This includes both the main app target and the OneSignalNotificationServiceExtension target

### 3. Android Versions
**File:** `android/app/build.gradle`
- Update `versionCode` (integer build number, e.g., 12 → 13)
- Update `versionName` (version string, e.g., "1.0.12" → "1.0.13")

### Version Update Checklist
1. Update `package.json` version
2. Update iOS `CURRENT_PROJECT_VERSION` (all 4 instances)
3. Update iOS `MARKETING_VERSION` (all 4 instances)
4. Update Android `versionCode`
5. Update Android `versionName`
6. Commit with message: "Bump version to X.X.X"
7. Build and test on both platforms before releasing

## Troubleshooting

If having issues with Facebook authentication, check the patch mentioned in the README:
- https://github.com/capawesome-team/capacitor-firebase/compare/main...YoloEdu:capacitor-firebase:main