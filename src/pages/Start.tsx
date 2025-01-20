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

// See if we have a local storage access token
const access_token = localStorage.getItem("access_token");

//console.log("Access Token: ", access_token);

const Home: React.FC = () => {
  const [userAccessToken, setUserAccessToken] = useState(access_token);
  const [loginOpen, setLoginOpen] = useState(false);

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
        return;
      }

      const success = await refreshAccessToken(session_key);

      if (success) {
        setLoginOpen(false);
        clearInterval(interval);
        Browser.close();
        Browser.removeAllListeners();
      }
    }, 1000);

    // Listen for the browser close event
    Browser.addListener("browserFinished", () => {
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
  // Load this once on the first time the page is loaded
  //
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
