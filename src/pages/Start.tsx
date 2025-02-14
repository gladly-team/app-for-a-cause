import React, { useEffect, useState } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import { Browser } from "@capacitor/browser";
import { CapacitorHttp, HttpResponse } from "@capacitor/core";
import "./Start.css";

// Function to generate a random string
const generateRandomString = (length: number) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Generate a random string to use as a session string
// We use this to connect back up to the backend
const sessionKey = generateRandomString(32);

const Home: React.FC = () => {
  const [userAccessToken, setUserAccessToken] = useState(localStorage.getItem("access_token"));
  const [loginOpen, setLoginOpen] = useState(false);

  const url = process.env.REACT_APP_SERVER + "/v5/login?login_type=mobile&session_key=" + localStorage.getItem("session_key");

  //
  // Used to load the auth page
  //
  const openLoginPage = async () => {
    if (loginOpen) {
      return;
    }

    // Set this so we don't open multiple login pages
    setLoginOpen(true);

    const session_key = localStorage.getItem("session_key");

    if (session_key) {
      const success = await refreshAccessToken(session_key);

      // If we have a success we can return because we already have an access token.
      if (success) {
        setLoginOpen(false);
        return;
      }
    } else {
      localStorage.setItem("session_key", sessionKey);
    }

    let url = process.env.REACT_APP_SERVER + "/v5/login?login_type=mobile&session_key=" + localStorage.getItem("session_key");

    // Used for non-device testing
    if (process.env.REACT_LOGIN_REDIRECT) {
      url = url + "&redirect_uri=http://127.0.0.1:8100/start";
    }

    // We poll the server to see if the user has logged in yet.
    const interval = setInterval(async () => {
      const session_key = localStorage.getItem("session_key");

      if (!session_key) {
        console.log("SPICER - Session Key not found");
        return;
      }

      console.log("SPICER - Start");
      //const success = await refreshAccessToken(session_key);
      console.log("SPICER - End");

      // if (success) {
      //   setLoginOpen(false);
      //   clearInterval(interval);
      //   Browser.close();
      //   Browser.removeAllListeners();
      // }
    }, 1000);

    // Listen for the browser close event
    Browser.addListener("browserFinished", () => {
      console.log("SPICER - Browser Finished");
      setLoginOpen(false);
      clearInterval(interval);
      Browser.removeAllListeners();
    });

    // Open the browser and log user in.
    Browser.open({
      windowName: "_self",
      presentationStyle: "popover",
      url: url,
    });
  };

  //
  // Make a request to the server to refresh the access token
  //
  const refreshAccessToken = async (access_token: string): Promise<boolean> => {
    const options = {
      url: process.env.REACT_APP_SERVER + "/v5/refresh-glady-access-token",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      data: { access_token: access_token },
    };

    const response: HttpResponse = await CapacitorHttp.post(options);
    const access_token_rt = response.data.access_token || null;

    console.log("SPICER", response.status);

    // Store access token in local storage.
    if (response.status == 200 && access_token_rt) {
      setUserAccessToken(access_token_rt);
      localStorage.setItem("access_token", access_token_rt);
      localStorage.removeItem("session_key");
      return true;
    }

    // Means either we have an error or the user is not fully logged in yet.
    return false;
  };

  //
  // Log the user out.
  //
  const logOut = async () => {
    // Clear the access token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("session_key");

    // Clear variables
    setUserAccessToken(null);

    let url = process.env.REACT_APP_SERVER + "/v5/logout?login_type=mobile&access_token=" + userAccessToken;

    // Used for non-device testing
    if (process.env.REACT_LOGIN_REDIRECT) {
      url = url + "&redirect_uri=http://127.0.0.1:8100/start";
    }

    // Listen for the browser close event
    Browser.addListener("browserFinished", () => {
      setTimeout(() => {
        setLoginOpen(false);
        openLoginPage();
      }, 1000);
    });

    // If after 2 seconds the browser is still open we close it.
    setTimeout(() => {
      Browser.close();

      setTimeout(() => {
        setLoginOpen(false);
        openLoginPage();
      }, 1000);
    }, 2000);

    // Open the browser and log user in.
    await Browser.open({
      windowName: "_self",
      presentationStyle: "popover",
      url: url,
    });
  };

  //
  // Load this once on the first time the page is loaded
  //
  useEffect(() => {
    // console.log(userAccessToken);
    // // If we are not logged in we need an access token.
    // if (!userAccessToken) {
    //   openLoginPage();
    // }
  }, []);

  return (
    <iframe src={url} width="100%" height="100%" frameBorder="0"></iframe>
    // <IonPage>
    //   <IonContent fullscreen>
    //     <div className="container">{!userAccessToken ? <p>Loading....</p> : <Dashboard userAccessToken={userAccessToken} logOut={logOut} />}</div>
    //   </IonContent>
    // </IonPage>
  );
};

export default Home;
