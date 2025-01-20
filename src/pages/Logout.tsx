import React, { useEffect } from "react";
import { useIonRouter } from "@ionic/react";

const Logout: React.FC = () => {
  const router = useIonRouter();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/start");
    }

    // Clear the access token from local storage
    localStorage.removeItem("access_token");
    localStorage.removeItem("session_key");

    // Redirect to the start page
    window.location.reload();
  }, []);

  return null;
};

export default Logout;
