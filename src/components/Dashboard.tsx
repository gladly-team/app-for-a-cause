import React, { useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import { IonContent, IonPage } from "@ionic/react";
import "./Dashboard.css";

interface DashboardProps {
  userAccessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAccessToken }) => {
  const router = useIonRouter();

  //
  // Take the user to the leaderboard screen.
  //
  const goToLeaderboard = () => {
    router.push("/leaderboard");
  };

  //
  // Function to handle received messages from the iframe
  //
  function receiveMessage(event: any) {
    // TODO(spicer): Add origin check for added security
    // if (event.origin !== 'http://127.0.0.1:9000') return

    // Check if the message is for us. If not, ignore it.
    if (typeof event.data.action === "undefined") return;

    // Log or use the received message
    //console.log("Received message from child:", event.data, event.origin);

    // Switch based on which action was sent in.
    switch (event.data.action) {
      // Load the leaderboard screen
      case "mobile-screen-leaderboard":
        goToLeaderboard();
        break;

      // Load logout screen
      case "mobile-screen-logout":
        router.push("/logout", "none");
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

  return (
    <iframe
      src={process.env.REACT_APP_SERVER + "/v5/mobile/dashboard?access_token=" + userAccessToken}
      frameBorder="0"
      allowFullScreen
      style={{ width: "100%", height: "100%" }}
    ></iframe>
  );
};

export default Dashboard;
