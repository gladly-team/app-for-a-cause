import { logInfo, logError, logDebug } from "../services/logService";

export interface ReferralData {
  referrer?: string;
  campaign?: string;
  feature?: string;
  channel?: string;
  stage?: string;
  tags?: string[];
  data?: any;
}

export class BranchService {
  private static referralData: ReferralData | null = null;

  static setReferralData(data: ReferralData): void {
    if (!data.campaign) {
      return;
    }

    this.referralData = data;
    // Store in localStorage for persistence
    localStorage.setItem("referralData", JSON.stringify(data));

    // Log Branch environment indicators
    if (data.data) {
      console.log("Full Branch Data: ", data.data);
    }
  }

  static getReferralData(): ReferralData | null {
    if (this.referralData) {
      return this.referralData;
    }

    // Try to get from localStorage
    const storedData = localStorage.getItem("referralData");
    if (storedData) {
      try {
        this.referralData = JSON.parse(storedData);
        return this.referralData;
      } catch (error) {
        console.error("Error parsing referral data:", error);
      }
    }

    return null;
  }

  static clearReferralData(): void {
    this.referralData = null;
    localStorage.removeItem("referralData");
  }

  static isTestMode(): boolean {
    const data = this.getReferralData();
    if (!data?.data) return false;

    // Check various indicators of test mode
    return data.data["~branch_key"]?.startsWith("key_test_") || data.data["~creation_source"] === 3 || data.data["+test"] === true;
  }

  static getBranchEnvironment(): "test" | "live" | "unknown" {
    const data = this.getReferralData();
    if (!data?.data) return "unknown";

    if (data.data["~branch_key"]?.startsWith("key_test_")) {
      return "test";
    } else if (data.data["~branch_key"]?.startsWith("key_live_")) {
      return "live";
    }

    return "unknown";
  }
}
