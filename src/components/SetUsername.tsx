import React, { useEffect } from "react";
import { getUrlPostFix } from "../services/url";
import { useIonRouter, useIonAlert } from "@ionic/react";

interface SetUsernameProps {
  userAccessToken: string;
  onUsernameSet: () => void;
}

const SetUsername: React.FC<SetUsernameProps> = ({ onUsernameSet, userAccessToken }) => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();

  //
  // Receive messages from the webserver Web View
  //
  function receiveMessage(event: any) {
    if (typeof event.data.action === "undefined") return;

    switch (event.data.action) {
      // On username setup success
      case "mobile-username-updated":
        onUsernameSet();
        break;

      // On username setup error
      case "mobile-username-error":
        presentAlert({
          header: "Username Setup Failed",
          message: "Could not complete username setup. Please try again.",
          buttons: ["OK"],
        });
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

  return userAccessToken ? (
    <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/set-username?access_token=${userAccessToken}&${getUrlPostFix()}`} width="100%" height="100%" frameBorder="0" />
  ) : (
    <p>Loading...</p>
  );
};

export default SetUsername;
