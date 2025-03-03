import { Capacitor } from "@capacitor/core";

export const getUrlPostFix = (): string => {
  return "platform=mobile&platform_type=" + Capacitor.getPlatform();
};
