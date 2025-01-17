import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "App for a Cause",
  webDir: "build",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
