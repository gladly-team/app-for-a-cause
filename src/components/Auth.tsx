import React, { useEffect, useState } from "react";
import { getUrlPostFix } from "../services/url";
//import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
//import { StatusBar, Style } from "@capacitor/status-bar";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { useIonAlert, useIonRouter } from "@ionic/react";
import { logInfo, logError, logDebug } from "../services/logService";
import { BranchService } from "../services/branch";
import { trackCompleteRegistration } from "../services/facebookPixel";

interface AuthProps {
  onAuthSuccess: () => void;
}

// const setBackgroundColor = async () => {
//   await EdgeToEdge.setBackgroundColor({ color: "#00000" });
//   await StatusBar.setStyle({ style: Style.Dark });
// };

let isAuthInitialized = false;

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [loginUrl, setLoginUrl] = useState<string>("");

  //
  // Load Google Sign In.
  //
  const googleSignIn = async () => {
    if (isAuthInitialized) {
      logDebug("Google sign-in already initialized");
      return;
    }

    isAuthInitialized = true;

    logInfo("Google sign-in attempt initiated");
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const user = result.user;
      const credential = result.credential;
      if (user && credential) {
        logInfo("Google sign-in successful");

        // Track Facebook Pixel CompleteRegistration event for new users
        if (result.additionalUserInfo?.isNewUser) {
          trackCompleteRegistration({
            mobile: true,
            registration_method: "google",
          });
          logInfo("Tracked CompleteRegistration for new Google user");
        }

        onAuthSuccess();
      } else {
        logError("Google sign-in failed - incomplete user data", {
          hasUser: !!user,
          hasCredential: !!credential,
        });
      }

      isAuthInitialized = false;
    } catch (error) {
      isAuthInitialized = false;

      logError("Google sign-in error", {
        error: String(error),
        stack: (error as Error).stack,
      });

      presentAlert({
        header: "Google Sign-In Failed",
        message: "Could not complete Google sign-in. Please try again.",
        buttons: ["OK"],
      });
    }
  };

  //
  // Load Facebook Sign In.
  //
  const facebookSignIn = async () => {
    if (isAuthInitialized) {
      logDebug("Facebook sign-in already initialized");
      return;
    }

    isAuthInitialized = true;

    logInfo("Facebook sign-in attempt initiated");
    try {
      const result = await FirebaseAuthentication.signInWithFacebook();
      const user = result.user;
      const credential = result.credential;
      if (user && credential) {
        logInfo("Facebook sign-in successful");

        // Track Facebook Pixel CompleteRegistration event for new users
        if (result.additionalUserInfo?.isNewUser) {
          trackCompleteRegistration({
            mobile: true,
            registration_method: "facebook",
          });
          logInfo("Tracked CompleteRegistration for new Facebook user");
        }

        onAuthSuccess();
      } else {
        logError("Facebook sign-in failed - incomplete user data", {
          hasUser: !!user,
          hasCredential: !!credential,
        });
      }

      isAuthInitialized = false;
    } catch (error) {
      isAuthInitialized = false;

      logError("Facebook sign-in error", {
        error: String(error),
        stack: (error as Error).stack,
      });

      presentAlert({
        header: "Facebook Sign-In Failed",
        message: "Could not complete Facebook sign-in. Please try again.",
        buttons: ["OK"],
      });
    }
  };

  //
  // Load Apple Sign In.
  //
  const appleSignIn = async () => {
    if (isAuthInitialized) {
      logDebug("Apple sign-in already initialized");
      return;
    }

    isAuthInitialized = true;

    logInfo("Apple sign-in attempt initiated");
    try {
      const result = await FirebaseAuthentication.signInWithApple({
        scopes: ["email", "name"],
      });
      const user = result.user;
      const credential = result.credential;
      if (user && credential) {
        logInfo("Apple sign-in successful");

        // Track Facebook Pixel CompleteRegistration event for new users
        if (result.additionalUserInfo?.isNewUser) {
          trackCompleteRegistration({
            mobile: true,
            registration_method: "apple",
          });
          logInfo("Tracked CompleteRegistration for new Apple user");
        }

        onAuthSuccess();
      } else {
        logError("Apple sign-in failed - incomplete user data", {
          hasUser: !!user,
          hasCredential: !!credential,
        });
      }

      isAuthInitialized = false;
    } catch (error) {
      isAuthInitialized = false;

      logError("Apple sign-in error", {
        error: String(error),
        stack: (error as Error).stack,
      });

      // presentAlert({
      //   header: "Apple Sign-In Failed",
      //   message: "Could not complete Apple sign-in. Please try again.",
      //   buttons: ["OK"],
      // });
    }
  };

  // Function to forward to a new Ionic window with the given URL
  const forwardPage = async (url: string, title: string) => {
    logDebug("Forwarding to page", { url, title });
    localStorage.setItem("forward-page-title", title);
    localStorage.setItem("forward-page-iframe-url", url);
    router.push("/page");
  };

  // Build the login URL with all referral data
  const buildLoginUrl = async () => {
    const postfix = await getUrlPostFix();
    let url = `${process.env.REACT_APP_SERVER}/v5/mobile/login?${postfix}`;

    // Add all referral data if available
    const referralData = BranchService.getReferralData();

    logDebug("Building login URL with referral data: " + referralData);

    if (referralData) {
      // Add each piece of referral data as a URL parameter
      if (referralData.referrer) {
        url += `&referrer=${encodeURIComponent(referralData.referrer)}`;
      }
      if (referralData.campaign) {
        url += `&campaign=${encodeURIComponent(referralData.campaign)}`;
      }
      if (referralData.feature) {
        url += `&feature=${encodeURIComponent(referralData.feature)}`;
      }
      if (referralData.channel) {
        url += `&channel=${encodeURIComponent(referralData.channel)}`;
      }
      if (referralData.stage) {
        url += `&stage=${encodeURIComponent(referralData.stage)}`;
      }
      if (referralData.tags && Array.isArray(referralData.tags)) {
        url += `&tags=${encodeURIComponent(referralData.tags.join(","))}`;
      }
      // Pass any additional custom data as a JSON string
      if (referralData.data) {
        const customData = { ...referralData.data };
        // Remove the standard Branch parameters we've already added
        delete customData.referrer;
        delete customData["~campaign"];
        delete customData["~feature"];
        delete customData["~channel"];
        delete customData["~stage"];
        delete customData["~tags"];

        // Only add if there's remaining custom data
        if (Object.keys(customData).length > 0) {
          url += `&branchData=${encodeURIComponent(JSON.stringify(customData))}`;
        }
      }
    }

    logDebug("Final login URL: " + url);

    return url;
  };

  //
  // Receive messages from the webserver Web View
  //
  function receiveMessage(event: any) {
    if (typeof event.data.action === "undefined") return;

    switch (event.data.action) {
      case "mobile-login-google":
        googleSignIn();
        break;

      case "mobile-login-facebook":
        facebookSignIn();
        break;

      case "mobile-login-email":
        forwardPage(event.data.url, "Email Login");
        break;

      case "mobile-login-apple":
        appleSignIn();
        break;

      default:
        logDebug("Unknown action received", { action: event.data.action });
        break;
    }
  }

  // //
  // // Set the background color and status bar style
  // //
  // useEffect(() => {
  //   setBackgroundColor();
  // });

  //
  // Load on component load.
  //
  useEffect(() => {
    logInfo("Auth component mounted");

    // Build and set the login URL
    buildLoginUrl().then((url) => {
      setLoginUrl(url);
    });

    window.addEventListener("message", receiveMessage, false);
    return () => {
      logDebug("Auth component unmounting");
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return loginUrl ? <iframe src={loginUrl} width="100%" height="100%" style={{ border: "none" }} /> : <p>Loading...</p>;
};

export default Auth;
