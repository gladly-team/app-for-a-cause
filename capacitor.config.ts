import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "Gladly Mobile",
  webDir: "build",
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
