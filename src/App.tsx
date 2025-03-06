import React from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import Start from "./pages/Start";
import Page from "./pages/Page";
import Games from "./pages/Games";
import Leaderboard from "./pages/Leaderboard";
import OneSignal from "onesignal-cordova-plugin";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  // Remove this method to stop OneSignal Debugging
  OneSignal.Debug.setLogLevel(6);

  // Replace YOUR_ONESIGNAL_APP_ID with your OneSignal App ID
  OneSignal.initialize("d1e096f4-b4ec-4d51-9822-19d9efee045b");

  OneSignal.Notifications.addEventListener("click", async (e) => {
    const clickData = await e.notification;
    console.log("Notification Clicked : " + clickData);
  });

  OneSignal.Notifications.requestPermission(true).then((success: boolean) => {
    console.log("Notification permission granted " + success);
  });

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/start">
            <Start />
          </Route>
          <Route path="/games">
            <Games />
          </Route>
          <Route path="/page">
            <Page />
          </Route>
          <Route path="/leaderboard">
            <Leaderboard />
          </Route>
          <Route exact path="/">
            <Redirect to="/start" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
