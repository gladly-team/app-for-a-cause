import { initializeApp } from "firebase/app";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { isPlatform } from "@ionic/react";
import { getAuth, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";

let isFirebaseInitialized = false;
let authInitialized = false;
let initializationError: Error | null = null;

//
// Check if we have a user
//
export const hasUser = async (): Promise<boolean> => {
  try {
    if (!isPlatform("capacitor")) {
      // For web platform, wait for Firebase to initialize first
      if (!isFirebaseInitialized) {
        await initializeFirebase();
      }

      const auth = getAuth();

      // If we already have a user, return immediately
      if (auth.currentUser) {
        return true;
      }

      // Wait for auth state to be determined AND for a user to be present
      const hasExistingUser = await new Promise<boolean>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe(); // Cleanup listener
          resolve(!!user); // Resolve with true if we have a user, false otherwise
        });
      });

      return hasExistingUser;
    }

    // For Capacitor platform
    const currentUser = await FirebaseAuthentication.getCurrentUser();
    return !!currentUser?.user;
  } catch (error) {
    console.error("Error checking user:", error);
    return false;
  }
};

//
// Return an access token for the current user
//
export const getAccessToken = async (): Promise<string | undefined> => {
  if (initializationError) {
    console.error("Cannot get token due to initialization error:", initializationError);
    return undefined;
  }

  if (!isFirebaseInitialized) {
    console.log("Firebase not initialized, initializing now...");
    await initializeFirebase();
  }

  if (!isPlatform("capacitor")) {
    // For web platform, wait for auth state if needed
    const auth = getAuth();
    if (!auth.currentUser) {
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve();
        });
      });
    }

    // Now try to get the token
    const idToken = await auth.currentUser?.getIdToken(true);
    if (idToken) {
      return idToken;
    }
  }

  // For Capacitor or as fallback
  const currentUser = await FirebaseAuthentication.getCurrentUser();

  if (!currentUser?.user) {
    return undefined;
  }

  const result = await FirebaseAuthentication.getIdToken();
  return result.token;
};

//
// Get the current user
//
export const getCurrentUser = async () => {
  return await FirebaseAuthentication.getCurrentUser();
};

//
// Initialize Firebase
//
export const initializeFirebase = async () => {
  if (isFirebaseInitialized) {
    return;
  }

  try {
    if (isPlatform("capacitor")) {
      console.log("Initializing Firebase for Capacitor platform");
      await FirebaseAuthentication.addListener("authStateChange", (change) => {
        authInitialized = true;
      });

      // Verify initialization worked
      const result = await FirebaseAuthentication.getCurrentUser();
    } else {
      const firebaseConfig = {
        apiKey: "AIzaSyCMkst3LTWYPv4CQ5AcR7ISwf1qPXRby_c",
        authDomain: "tab-for-a-cause.firebaseapp.com",
        databaseURL: "https://tab-for-a-cause.firebaseio.com",
        projectId: "tab-for-a-cause",
        storageBucket: "tab-for-a-cause.firebasestorage.app",
        messagingSenderId: "265155358643",
        appId: "1:265155358643:web:1e0ad7c0287d55c7d6a5c6",
      };

      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);

      // Wait for the initial auth state to be determined
      await new Promise<void>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
          auth,
          (user) => {
            authInitialized = true;
            unsubscribe();
            resolve();
          },
          (error) => {
            initializationError = error;
            unsubscribe();
            reject(error);
          }
        );
      });
    }

    isFirebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization error:", error);
    initializationError = error as Error;
    throw error;
  }
};

//
// Sign out the current user
//
export const signOut = async (): Promise<void> => {
  try {
    await FirebaseAuthentication.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};
