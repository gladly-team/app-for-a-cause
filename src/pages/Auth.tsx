import React, { useEffect, useState } from "react";
import { SplashScreen } from "@capacitor/splash-screen";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getAccessToken, initializeFirebase, hasUser } from "../services/firebaseAuth";
import { useIonRouter, useIonAlert, IonContent, IonPage } from "@ionic/react";

const Auth: React.FC = () => {
  console.log("In Auth");

  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [email, setEmail] = useState("me@spicer.cc");
  const [password, setPassword] = useState("foobar");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  //
  // Take the user to the dashboard screen.
  //
  const goToDashboard = () => {
    router.push("/start", "forward", "pop");
  };

  //
  // Function to handle form submission for email and password login
  //
  const onSubmit = async (e: any) => {
    e.preventDefault();

    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email,
      password: password,
    });

    const user = result.user;

    if (user) {
      console.log("SPICER Login", user.uid, user.email);

      console.log(await getAccessToken());
    }

    goToDashboard();
  };

  //
  // Function to handle Google login
  //
  const googleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithGoogle();

    const user = result.user;
    const credential = result.credential;

    if (user && credential) {
      goToDashboard();
    }
  };

  //
  // Function to handle Apple login
  //
  const appleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithApple();

    const user = result.user;
    const credential = result.credential;

    if (user && credential) {
      console.log("SPICER Login", user.uid, user.email, credential.accessToken);

      console.log(await getAccessToken());
    }

    goToDashboard();
  };

  //
  // Function to handle email login
  //
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
          goToDashboard();
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
  // Function to handle received messages from the iframe
  //
  function receiveMessage(event: any) {
    // TODO(spicer): Add origin check for added security
    // if (event.origin !== 'http://127.0.0.1:9000') return

    // Log or use the received message
    //console.log("Received message from child:", event.data, event.origin);

    // Check if the message is for us. If not, ignore it.
    if (typeof event.data.action === "undefined") return;

    // Switch based on which action was sent in.
    switch (event.data.action) {
      // Login with Google
      case "mobile-login-google":
        googleSignIn();
        break;

      // Login with Facebook
      case "mobile-login-facebook":
        alert("Login with Facebook");
        break;

      // Login with Email
      case "mobile-login-email":
        if (event.data.email) {
          emailSignIn(event.data.email);
        }
        break;

      // Login with Apple
      case "mobile-login-apple":
        appleSignIn(); // Actually call the appleSignIn function instead of showing alert
        break;

      default:
        break;
    }
  }

  //
  // Add event listener for messages from the iframe
  //
  useEffect(() => {
    // Add event listener when the component mounts
    window.addEventListener("message", receiveMessage, false);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  //
  // Check for existing user session
  //
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        await initializeFirebase();
        const isLoggedIn = await hasUser();

        if (isLoggedIn) {
          console.log("User is already logged in.");
          goToDashboard();
        } else {
          console.log("User is not logged in.");
          await SplashScreen.hide();
        }
      } catch (error) {
        console.error("Error during session check:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []); // Empty dependency array ensures this runs only once

  if (isCheckingSession) {
    return <p>Checking Session...</p>;
  }

  return <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/login`} width="100%" height="100%" frameBorder="0"></iframe>;
};

export default Auth;
