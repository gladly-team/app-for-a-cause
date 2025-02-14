import React, { useEffect, useRef, useState } from "react";
import { useIonRouter } from "@ionic/react";
import { IonContent, IonPage } from "@ionic/react";
import { IonButtons, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonIcon } from "@ionic/react";
import { arrowBack } from "ionicons/icons";
//import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMkst3LTWYPv4CQ5AcR7ISwf1qPXRby_c",
  authDomain: "tab-for-a-cause.firebaseapp.com",
  databaseURL: "https://tab-for-a-cause.firebaseio.com",
  projectId: "tab-for-a-cause",
  storageBucket: "tab-for-a-cause.firebasestorage.app",
  messagingSenderId: "265155358643",
  appId: "1:265155358643:web:1e0ad7c0287d55c7d6a5c6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// const firebaseConfig = {
//   apiKey: "AIzaSyDZKbk3DzJwA9nWLlpt6hjqhTm6WY-WOnk",
//   authDomain: "tab-for-a-cause.firebaseapp.com",
//   projectId: "tab-for-a-cause",
//   databaseURL: "https://tab-for-a-cause.firebaseio.com",
// };

// // Initialize Firebase
// const fbApp = initializeApp(firebaseConfig);
// const auth = getAuth(fbApp);

// auth.onAuthStateChanged(function (user) {
//   console.log("SPICER State Change");
//   console.log(user);
//   alert("On Auth State Changed");
// });

// // https://github.com/firebase/firebaseui-web/blob/master/demo/public/app.js
// var uiConfig = {
//   signInFlow: "redirect", // redirect or popup (need popup for mobile)
//   signInSuccessUrl: '{{ route("after-login") }}',
//   signInOptions: [
//     {
//       provider: auth.GoogleAuthProvider.PROVIDER_ID,
//       scopes: ["https://www.googleapis.com/auth/userinfo.email"],
//     },
//     {
//       provider: auth.FacebookAuthProvider.PROVIDER_ID,
//       scopes: ["email"],
//     },
//     {
//       provider: auth.EmailAuthProvider.PROVIDER_ID,
//       requireDisplayName: false,
//     },
//     {
//       provider: "apple.com",
//     },
//   ],
//   tosUrl: '{{ config("constants.links.terms") }}',
//   privacyPolicyUrl: '{{ config("constants.links.privacy") }}',
// };

// // Initialize the FirebaseUI Widget using Firebase.
// var ui = new auth.AuthUI(auth);

// // The start method will wait until the DOM is loaded.
// ui.start("#firebaseui-auth-container", uiConfig);

// // Initialize Firebase Authentication and get a reference to the service
// export const auth = getAuth(fbApp);
// export default fbApp;

const Auth: React.FC = () => {
  // const router = useIonRouter();
  // const modal = useRef<HTMLIonModalElement>(null);

  // //
  // // Take the user to the dashboard screen.
  // //
  // const goToDashboard = () => {
  //   router.push("/start", "back");
  // };

  // //
  // // Function to handle received messages from the iframe
  // //
  // function receiveMessage(event: any) {
  //   // TODO(spicer): Add origin check for added security
  //   // if (event.origin !== 'http://127.0.0.1:9000') return

  //   // Log or use the received message
  //   //console.log("Received message from child:", event.data, event.origin);

  //   // Check if the message is for us. If not, ignore it.
  //   if (typeof event.data.action === "undefined") return;

  //   // Switch based on which action was sent in.
  //   switch (event.data.action) {
  //     // Load the dashboard screen
  //     case "mobile-screen-dashboard":
  //       goToDashboard();
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // //
  // // Add event listener for messages from the iframe
  // //
  // useEffect(() => {
  //   // Add event listener when the component mounts
  //   window.addEventListener("message", receiveMessage, false);

  //   // Cleanup the event listener when the component unmounts
  //   return () => {
  //     window.removeEventListener("message", receiveMessage);
  //   };
  // }, []); // Empty dependency array ensures this runs only once

  const [email, setEmail] = useState("me@spicer.cc");
  const [password, setPassword] = useState("foobar");

  const onSubmit = async (e: any) => {
    e.preventDefault();

    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email: email,
      password: password,
    });

    const user = result.user;

    if (user) {
      console.log("SPICER Login", user.uid, user.email);

      console.log(await getIdToken());
    }

    // await signInWithEmailAndPassword(auth, email, password)
    //   .then((userCredential: any) => {
    //     const user = userCredential.user;
    //     console.log("SPICER Login", user.uid, user.email);
    //   })
    //   .catch((error: any) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     console.log("SPICER", errorCode, errorMessage);
    //     // ..
    //   });

    // await createUserWithEmailAndPassword(auth, "me@spicer.cc", "foobar")
    //   .then((userCredential: any) => {
    //     const user = userCredential.user;
    //     console.log("SPICER", user);
    //   })
    //   .catch((error: any) => {
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     console.log("SPICER", errorCode, errorMessage);
    //     // ..
    //   });
  };

  const getIdToken = async () => {
    const currentUser = await FirebaseAuthentication.getCurrentUser();
    if (!currentUser) {
      return;
    }
    const result = await FirebaseAuthentication.getIdToken();
    return result.token;
  };

  // New function to handle Google login
  const googleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithGoogle();

    const user = result.user;
    const credential = result.credential;

    if (user && credential) {
      console.log("SPICER Login", user.uid, user.email, credential.accessToken);

      console.log(await getIdToken());
    }
  };

  // New function to handle Google login
  const appleSignIn = async () => {
    const result = await FirebaseAuthentication.signInWithApple();

    const user = result.user;
    const credential = result.credential;

    if (user && credential) {
      console.log("SPICER Login", user.uid, user.email, credential.accessToken);

      console.log(await getIdToken());
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Auth</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <main>
          <section>
            <div>
              <div>
                <h1> FocusApp </h1>
                <form>
                  <div>
                    <label htmlFor="email-address">Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" />
                  </div>

                  <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" />
                  </div>

                  <button type="submit" onClick={onSubmit}>
                    Sign up
                  </button>
                </form>
                {/* New Google login button */}
                <button type="button" onClick={googleSignIn}>
                  Login with Google
                </button>
                {/* New Apple login button */}
                <button type="button" onClick={appleSignIn}>
                  Login with Apple
                </button>
              </div>
            </div>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Auth;
