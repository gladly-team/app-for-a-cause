import React, { useEffect } from "react";
import { getUrlPostFix } from "../services/url";

interface EmailVerificationProps {
  userAccessToken: string;
  onEmailVerified: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ userAccessToken, onEmailVerified }) => {
  //
  // Receive messages from the webserver Web View
  //
  function receiveMessage(event: any) {
    if (typeof event.data.action === "undefined") return;

    switch (event.data.action) {
      // On email verification success
      case "email-verified":
        onEmailVerified();
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

  return <iframe src={`${process.env.REACT_APP_SERVER}/v5/mobile/verify-email?access_token=${userAccessToken}&${getUrlPostFix()}`} width="100%" height="100%" frameBorder="0" />;
};

export default EmailVerification;
