import React, { useEffect, useState } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import { CapacitorHttp, HttpResponse } from "@capacitor/core";
import "./Start.css";

import { Browser } from "@capacitor/browser";

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

// See if we have a local storage access token
const access_token = localStorage.getItem("access_token");
//const access_token = "4ea1a7d2b3249408ae2578ce98ca925a";

console.log("Access Token: ", access_token);

const Home: React.FC = () => {
  // use a state variable to store if the browser has been closed
  const [userAccessToken, setUserAccessToken] = useState(access_token);

  // Used to load the auth page
  const openLoginPage = async () => {
    const session_key = localStorage.getItem("session_key");

    if (session_key) {
      refreshAccessToken(session_key);
      return;
    } else {
      localStorage.setItem("session_key", sessionKey);
    }

    let url = process.env.REACT_APP_SERVER + "/v5/login?login_type=mobile&session_key=" + sessionKey;

    // Used for non-device testing
    if (process.env.REACT_LOGIN_REDIRECT) {
      url = url + "&redirect_uri=http://127.0.0.1:8100/start";
    }

    await Browser.open({
      windowName: "_self",
      presentationStyle: "popover",
      url: url,
    });
  };

  // Make a request to the server to refresh the access token
  const refreshAccessToken = async (access_token: string) => {
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

    // Store access token in local storage.
    if (access_token_rt) {
      setUserAccessToken(access_token_rt);
      localStorage.setItem("access_token", access_token_rt);
      localStorage.removeItem("session_key");
    } else {
      setUserAccessToken("");
      localStorage.removeItem("access_token");
      localStorage.removeItem("session_key");
      alert("Error: Could not login. Please try again.");
      openLoginPage();
    }
  };

  // Add a listener to the browserFinished event
  Browser.addListener("browserFinished", () => {
    // Make a call to the server to make sure this access token is valid and refresh for a new one.
    refreshAccessToken(sessionKey);
  });

  Browser.addListener("browserPageLoaded", () => {
    console.log("Browser Page Loaded");
  });

  // Load this once on the first time the page is loaded
  useEffect(() => {
    // If we are not logged in we need an access token.
    if (!access_token) {
      openLoginPage();
    }
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container">{!userAccessToken ? <p>Loading....</p> : <Dashboard userAccessToken={userAccessToken} />}</div>
      </IonContent>
    </IonPage>
  );

  // return (
  //   <IonPage>
  //     <IonContent fullscreen>
  //       <div className="container">
  //         <iframe src={process.env.REACT_APP_SERVER + "/v5/mobile/dashboard"} frameBorder="0" allowFullScreen style={{ width: "100%", height: "100%" }}></iframe>
  //       </div>
  //     </IonContent>
  //   </IonPage>
  //   // <IonPage>
  //   //   <IonHeader>
  //   //     <IonToolbar>
  //   //       <IonTitle>Blank</IonTitle>
  //   //     </IonToolbar>
  //   //   </IonHeader>
  //   //   <IonContent fullscreen>
  //   //     <IonHeader collapse="condense">
  //   //       <IonToolbar>
  //   //         <IonTitle size="large">Blank</IonTitle>
  //   //       </IonToolbar>
  //   //     </IonHeader>
  //   //     <ExploreContainer name="Tab 1 page" />
  //   //   </IonContent>
  //   // </IonPage>
  // );
};

export default Home;
