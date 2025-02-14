import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useIonRouter } from "@ionic/react";
import Dashboard from "../components/Dashboard";
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

      if (!token) {
        router.push("/auth", "forward", "replace");
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
    const initAuth = async () => {
      try {
        // Initialize Firebase first
        await initializeFirebase();

        // Wait a bit longer for auth state to be fully restored
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Now check auth status
        await checkAuthStatus();
      } catch (error) {
        console.error("Init error:", error);
        setIsLoading(false);
        router.push("/auth", "back", "replace");
      }
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="container">
            <p>Loading...</p>
          </div>
        </IonContent>
      </IonPage>
    );
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
