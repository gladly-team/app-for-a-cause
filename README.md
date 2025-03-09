# Notes on building Icons and Splash Screens

- Update the files located `assets/icon.png` and `assets/splash.png`. Note that Android uses the icon for the splash screen. The splash.png file is just for IOS.

- Run `npx capacitor-assets generate` to build out all the different image files.

Useful links.

- https://github.com/ionic-team/capacitor-assets
- https://capacitorjs.com/docs/guides/splash-screens-and-icons
- https://ionicframework.com/docs/native/splash-screen

# Facebook Auth

Have to patch the library.

https://github.com/capawesome-team/capacitor-firebase/compare/main...YoloEdu:capacitor-firebase:main

node_modules/@capacitor-firebase/authentication/ios/Plugin/Handlers/FacebookAuthProviderHandler.swift

# Splash Screens

https://github.com/ionic-team/capacitor-assets/issues/495
