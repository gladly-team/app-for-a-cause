import React, { useEffect } from "react";
import { getUrlPostFix } from "../services/url";
import { useIonRouter, useIonAlert } from "@ionic/react";

interface SelectCauseProps {
  userAccessToken: string;
  onCauseSelect: () => void;
}

const SelectCause: React.FC<SelectCauseProps> = ({ onCauseSelect, userAccessToken }) => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();

  //
  // Receive messages from the webserver Web View
  //
  function receiveMessage(event: any) {
    if (typeof event.data.action === "undefined") return;

    switch (event.data.action) {
      // On cause selection success
      case "mobile-screen-select-cause-success":
        onCauseSelect();
        break;

      // On cause selection error
      case "mobile-screen-select-cause-error":
        presentAlert({
          header: "Cause Selection Failed",
          message: "Could not complete cause selection. Please try again.",
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
    <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/select-cause?access_token=${userAccessToken}&${getUrlPostFix()}`} width="100%" height="100%" frameBorder="0" />
  ) : (
    <p>Loading...</p>
  );
};

export default SelectCause;
