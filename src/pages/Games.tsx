import "./Games.css";
import React, { useEffect, useRef, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { IonContent, IonPage } from "@ionic/react";
//import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
//import { StatusBar, Style } from "@capacitor/status-bar";
import { IonButtons, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
import { getUrlPostFix } from "../services/url";
import { getAccessToken } from "../services/firebaseAuth";

// const hideStatusBar = async () => {
//   await StatusBar.hide();
// };

// const setBackgroundColor = async () => {
//   await EdgeToEdge.setBackgroundColor({ color: "#00000" });
//   await StatusBar.setStyle({ style: Style.Dark });
// };

const Games: React.FC = () => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [urlPostFix, setUrlPostFix] = useState<string>("");

  //
  // Take the user to the dashboard screen.
  //
  const goToDashboard = () => {
    router.push("/start", "back");
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
      // Load the dashboard screen
      case "mobile-screen-dashboard":
        goToDashboard();
        break;
      default:
        break;
    }
  }

  //
  // Add event listener for messages from the iframe
  //
  useEffect(() => {
    // Hide the status bar
    //hideStatusBar();

    // Set the background color and status bar style
    //setBackgroundColor();

    // Add event listener when the component mounts
    window.addEventListener("message", receiveMessage, false);

    // Get the Firebase access token
    const fetchToken = async () => {
      const token = await getAccessToken();
      setAccessToken(token);
    };
    fetchToken();
    
    // Load URL postfix
    getUrlPostFix().then(postfix => {
      setUrlPostFix(postfix);
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={goToDashboard}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Game for a Cause</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {accessToken && urlPostFix ? (
          <iframe
            src={`${process.env.REACT_APP_SERVER}/v5/mobile/games?access_token=${accessToken}&${urlPostFix}`}
            frameBorder="0"
            allowFullScreen
            style={{ width: "100%", height: "100%" }}
          ></iframe>
        ) : (
          <p>Loading...</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Games;
