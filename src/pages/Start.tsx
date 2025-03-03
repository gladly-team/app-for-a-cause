import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import Auth from "../components/Auth";
import { Capacitor } from "@capacitor/core";
import SelectCause from "../components/SelectCause";
import SetUsername from "../components/SetUsername";
import { SplashScreen } from "@capacitor/splash-screen";
import { getAccessToken, initializeFirebase, signOut } from "../services/firebaseAuth";
import "./Start.css";

interface UserData {
  causeId?: string;
  username?: string;
}

const Start: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>();
  const [userData, setUserData] = useState<UserData | null>(null);

  // Call this when a user selects a cause.
  const onCauseSelect = async () => {
    if (userAccessToken) {
      fetchUserData(userAccessToken);
    }
  };

  // Call this when a user sets their username
  const onUsernameSet = async () => {
    if (userAccessToken) {
      fetchUserData(userAccessToken);
    }
  };

  // Log user out.
  const logOut = async () => {
    setIsTransitioning(true);
    try {
      await signOut();
      setUserAccessToken(undefined);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setTimeout(() => setIsTransitioning(false), 50);
  };

  // Fetch user data from API
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER}/v5/api/user`, {
        headers: {
          "X-Platform": "mobile",
          "X-Platform-Type": Capacitor.getPlatform(),
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      console.log("User data:", data);

      setUserData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Check if a user is logged in.
  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setIsTransitioning(true);
      setUserAccessToken(token);

      if (token) {
        await fetchUserData(token);
      }
      await SplashScreen.hide();
    } catch (error) {
      console.error("Auth check error:", error);
      setUserAccessToken(undefined);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTransitioning(false), 50);
    }
  };

  // Run on page Load.
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

  // Adding a new effect to check local storage for 'page-refresh'
  // and call checkAuthStatus if exists
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshVal = localStorage.getItem("page-refresh") || null;

      if (refreshVal) {
        localStorage.removeItem("page-refresh");
        checkAuthStatus();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return null;
  }

  // Helper function to determine which component to show
  const renderContent = () => {
    if (!userAccessToken) {
      return (
        <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
          <Auth onAuthSuccess={checkAuthStatus} />
        </div>
      );
    }

    if (!userData?.causeId) {
      return (
        <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
          <SelectCause userAccessToken={userAccessToken} onCauseSelect={onCauseSelect} />
        </div>
      );
    }

    if (!userData?.username) {
      return (
        <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
          <SetUsername userAccessToken={userAccessToken} onUsernameSet={onUsernameSet} />
        </div>
      );
    }

    return (
      <div className={`fade-component ${!isTransitioning ? "visible" : ""}`}>
        <Dashboard userAccessToken={userAccessToken} logOut={logOut} />
      </div>
    );
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container">{renderContent()}</div>
      </IonContent>
    </IonPage>
  );
};

export default Start;
