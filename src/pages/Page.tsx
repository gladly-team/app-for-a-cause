import React, { useEffect, useRef, useState } from "react";
import { useIonRouter, useIonAlert } from "@ionic/react";
import { IonContent, IonPage } from "@ionic/react";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { IonButtons, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";

const Page: React.FC = () => {
  const router = useIonRouter();
  const [presentAlert] = useIonAlert();
  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string | undefined>();

  //
  // Got back to the page we came from.
  //
  const goBack = () => {
    localStorage.setItem("page-refresh", "true");
    router.goBack();
  };

  //
  // Load Email Sign In.
  //
  const emailSignIn = async (email: string, password: string) => {
    try {
      const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
      const user = result.user;

      if (user) {
        goBack();
      }
    } catch (error: any) {
      console.log(error);

      // If error indicates the user does not exist, attempt to register the user instead
      if (error.code === "auth/user-not-found" || (error.message && error.message.includes("user not found"))) {
        try {
          const createResult = await FirebaseAuthentication.createUserWithEmailAndPassword({ email, password });
          const user = createResult.user;
          if (user) {
            goBack();
          }
        } catch (createError) {
          presentAlert({
            header: "Registration Failed",
            message: "Could not complete registration. Please try again.",
            buttons: ["OK"],
          });
        }
      } else {
        presentAlert({
          header: "Login Failed",
          message: "Could not complete email login. Please try again.",
          buttons: ["OK"],
        });
      }
    }
  };

  //
  // Receive messages from the webserver Web View
  //
  function receiveMessage(event: any) {
    if (typeof event.data.action === "undefined") return;

    switch (event.data.action) {
      case "mobile-login-email-submit":
        if (event.data.email && event.data.password) {
          emailSignIn(event.data.email, event.data.password);
        }
        break;

      default:
        break;
    }
  }

  //
  // Add event listener for messages from the iframe
  //
  useEffect(() => {
    setTitle(localStorage.getItem("forward-page-title") || "");
    setUrl(localStorage.getItem("forward-page-iframe-url") || "");

    // Add event listener when the component mounts
    window.addEventListener("message", receiveMessage, false);

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
            <IonButton onClick={goBack}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {url ? <iframe src={`${url}?access_token=${accessToken}`} frameBorder="0" allowFullScreen style={{ width: "100%", height: "100%" }}></iframe> : <p>Loading...</p>}
      </IonContent>
    </IonPage>
  );
};

export default Page;
