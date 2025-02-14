import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import Dashboard from "../components/Dashboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { getAccessToken, initializeFirebase, signOut } from "../services/firebaseAuth";
import "./Start.css";

const Home: React.FC = () => {
  const router = useIonRouter();
  const [userAccessToken, setUserAccessToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  //
  // Sign the user out
  //
  const logOut = async () => {
    try {
      await SplashScreen.show();
      await signOut();
      setUserAccessToken(undefined);
      router.push("/auth", "forward", "replace");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  //
  // Check the user's authentication status
  //
  const checkAuthStatus = async () => {
    try {
      const token = await getAccessToken();
      setUserAccessToken(token);

      console.log("Access Token:", token);

      if (!token) {
        router.push("/auth", "forward", "replace");
      } else {
        // Hide the splash
        await SplashScreen.hide();
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/auth", "forward", "replace");
    } finally {
      setIsLoading(false);
    }
  };

  //
  // Initialize Firebase and check auth status
  //
  useEffect(() => {
    console.log("Initializing Firebase and checking auth status");

    const initAuth = async () => {
      console.log("In initAuth...");

      try {
        // Initialize Firebase first
        await initializeFirebase();

        console.log("Done initializing Firebase");

        // Wait a bit longer for auth state to be fully restored
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Starting auth status check");

        // Now check auth status
        await checkAuthStatus();

        console.log("Done auth status check");
      } catch (error) {
        console.error("Init error:", error);
        setIsLoading(false);
        router.push("/auth", "back", "replace");
      }
    };

    initAuth();

    // Set up periodic token refresh (every 5 minutes)
    const refreshInterval = setInterval(() => {
      checkAuthStatus();
    }, 5 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container">{!userAccessToken ? <p>Loading...</p> : <Dashboard userAccessToken={userAccessToken} logOut={logOut} />}</div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
