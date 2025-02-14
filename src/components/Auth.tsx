import React, { useEffect } from "react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getAccessToken } from "../services/firebaseAuth";
import { useIonAlert } from "@ionic/react";

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
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

  const appleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithApple();
    const user = result.user;
    const credential = result.credential;
    if (user && credential) {
      console.log("Login successful", user.uid, user.email, credential.accessToken);
      console.log(await getAccessToken());
      onAuthSuccess();
    }
  };

  const emailSignIn = async (emailData: string) => {
    try {
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({
        email: emailData,
        password: "", // Password will be handled by the web flow
      });
      const user = result.user;
      if (user) {
        console.log("Email login successful:", user.uid);
        const token = await getAccessToken();
        if (token) {
          onAuthSuccess();
        }
      }
    } catch (error) {
      console.error("Email login error:", error);
      presentAlert({
        header: "Login Failed",
        message: "Could not complete email login. Please try again.",
        buttons: ["OK"],
      });
    }
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
        alert("Login with Facebook");
        break;

      case "mobile-login-email":
        if (event.data.email) {
          emailSignIn(event.data.email);
        }
        break;

      case "mobile-login-apple":
        appleSignIn();
        break;

      default:
        break;
    }
  }

  //
  // Load on component load.
  //
  useEffect(() => {
    window.addEventListener("message", receiveMessage, false);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/login`} width="100%" height="100%" frameBorder="0" />;
};

export default Auth;
