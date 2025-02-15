import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import Auth from "../components/Auth";
import { SplashScreen } from "@capacitor/splash-screen";
import { getAccessToken, initializeFirebase, signOut } from "../services/firebaseAuth";
import "./Start.css";

const Start: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>();

  //
  // Log user out.
  //
  const logOut = async () => {
    setIsTransitioning(true);
    try {
      await signOut();
      setUserAccessToken(undefined);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setTimeout(() => setIsTransitioning(false), 50);
  };

  //
  // Check if a user is logged in.
  //
  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setIsTransitioning(true);
      setUserAccessToken(token);
      await SplashScreen.hide();
    } catch (error) {
      console.error("Auth check error:", error);
      setUserAccessToken(undefined);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTransitioning(false), 50);
    }
  };

  //
  // Run on page Load.
  //
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
        <div className="container">
          {!userAccessToken ? (
            <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
              <Auth onAuthSuccess={checkAuthStatus} />
            </div>
          ) : (
            <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
              <Dashboard userAccessToken={userAccessToken} logOut={logOut} />
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Start;
