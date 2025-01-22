import "./Leaderboard.css";
import React, { useEffect, useRef, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { IonContent, IonPage } from "@ionic/react";
import { IonButtons, IonButton, IonModal, IonHeader, IonToolbar, IonTitle } from "@ionic/react";

const Leaderboard: React.FC = () => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const [userAccessToken, setUserAccessToken] = useState(localStorage.getItem("access_token"));

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

      // Load the learn levels screen
      case "mobile-screen-learn-levels":
        modal.current?.present();
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

    // See if we have a local storage access token
    const userAccessToken = localStorage.getItem("access_token");
    setUserAccessToken(userAccessToken);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <IonPage>
      <IonContent fullscreen>
        {userAccessToken ? (
          <iframe
            src={process.env.REACT_APP_SERVER + "/v5/mobile/leaderboard?access_token=" + userAccessToken}
            frameBorder="0"
            allowFullScreen
            style={{ width: "100%", height: "100%" }}
          ></iframe>
        ) : (
          "<p>Error: No Access Token. Please kill app and restart.</p>"
        )}

        <IonModal ref={modal} initialBreakpoint={1} breakpoints={[0, 1]}>
          <IonContent>
            {userAccessToken ? (
              <iframe
                src={process.env.REACT_APP_SERVER + "/v5/mobile/leaderboard-learn-levels?access_token=" + userAccessToken}
                frameBorder="0"
                allowFullScreen
                style={{ width: "100%", height: "100%" }}
              ></iframe>
            ) : (
              "<p>Error: No Access Token. Please kill app and restart.</p>"
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Leaderboard;
