import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.gladly.appforacause",
  appName: "App for a Cause",
  webDir: "build",
  backgroundColor: "#ffffff",
  plugins: {
    EdgeToEdge: {
      backgroundColor: "#000000",
    },
    CapacitorHttp: {
      enabled: true,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com", "apple.com", "facebook.com"],
    },
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      launchFadeOutDuration: 3000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER",
      showSpinner: true,
      androidSpinnerStyle: "small",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    BranchDeepLinks: {
      productionKey: "key_live_oAtcoTikQvdBTpSQTjbfHeaervbIpI2h",
      testKey: "key_test_asAkpKalTBiCNnRORmicTmngFtkQlMR3",
    },
  },

  ios: {
    handleApplicationNotifications: false,
  },
};

export default config;
