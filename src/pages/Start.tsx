import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import Auth from "../components/Auth";
import { SplashScreen } from "@capacitor/splash-screen";
import { getAccessToken, initializeFirebase, signOut } from "../services/firebaseAuth";
import "./Start.css";

const Start: React.FC = () => {
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const logOut = async () => {
    try {
      await signOut();
      setUserAccessToken(undefined);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setUserAccessToken(token);

      if (token) {
        await SplashScreen.hide();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUserAccessToken(undefined);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeFirebase();
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await checkAuthStatus();
      } catch (error) {
        console.error("Init error:", error);
        setIsLoading(false);
        setUserAccessToken(undefined);
      }
    };

    initAuth();

    const refreshInterval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container">{!userAccessToken ? <Auth onAuthSuccess={checkAuthStatus} /> : <Dashboard userAccessToken={userAccessToken} logOut={logOut} />}</div>
      </IonContent>
    </IonPage>
  );
};

export default Start;
