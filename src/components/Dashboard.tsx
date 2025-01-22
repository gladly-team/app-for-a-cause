import React, { useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import "./Dashboard.css";
import { Browser } from "@capacitor/browser";

interface DashboardProps {
  logOut: () => void;
  userAccessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAccessToken, logOut }) => {
  const router = useIonRouter();

  //
  // Take the user to the games screen.
  //
  const goToGames = () => {
    router.push("/games");
  };

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
      // Load the games screen
      case "mobile-screen-games":
        goToGames();
        break;

      // Load the leaderboard screen
      case "mobile-screen-leaderboard":
        goToLeaderboard();
        break;

      // Load logout screen
      case "mobile-screen-logout":
        logOut();
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
