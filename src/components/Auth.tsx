import React, { useEffect } from "react";
import { getUrlPostFix } from "../services/url";
//import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
//import { StatusBar, Style } from "@capacitor/status-bar";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { useIonAlert, useIonRouter } from "@ionic/react";

interface AuthProps {
  onAuthSuccess: () => void;
}

// const setBackgroundColor = async () => {
//   await EdgeToEdge.setBackgroundColor({ color: "#00000" });
//   await StatusBar.setStyle({ style: Style.Dark });
// };

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();

  //
  // Load Google Sign In.
  //
  const googleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const user = result.user;
    const credential = result.credential;
    if (user && credential) {
      onAuthSuccess();
    }
  };

  //
  // Load Facebook Sign In.
  //
  const facebookSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithFacebook();
    const user = result.user;
    const credential = result.credential;
    if (user && credential) {
      onAuthSuccess();
    }
  };

  //
  // Load Apple Sign In.
  //
  const appleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithApple();
    const user = result.user;
    const credential = result.credential;
    if (user && credential) {
      onAuthSuccess();
    }
  };

  // Function to forward to a new Ionic window with the given URL
  const forwardPage = async (url: string, title: string) => {
    localStorage.setItem("forward-page-title", title);
    localStorage.setItem("forward-page-iframe-url", url);
    router.push("/page");
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
    window.addEventListener("message", receiveMessage, false);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/login?${getUrlPostFix()}`} width="100%" height="100%" frameBorder="0" />;
};

export default Auth;
