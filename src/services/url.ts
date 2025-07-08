import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export const getUrlPostFix = async (): Promise<string> => {
  const appInfo = await App.getInfo();
  return "platform=mobile&platform_type=" + Capacitor.getPlatform() + "&app_version=" + appInfo.version;
};
