import React, { useEffect, useRef } from "react";
import { useIonRouter, useIonAlert, IonModal, IonContent } from "@ionic/react";
import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem, AdMobError } from "@capacitor-community/admob";

import "./Dashboard.css";

interface DashboardProps {
  logOut: () => void;
  userAccessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAccessToken, logOut }) => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();

  //
  // Take the user to the games screen.
  //
  const goToGames = () => {
    router.push("/games");
  };

  //
  // Take the user to the leaderboard screen.
  //
  const goToLeaderboard = () => {
    router.push("/leaderboard");
  };

  //
  // This is called when the user clicks on the reward ad button.
  //
  const loadRewardAd = async () => {
    await AdMob.initialize({
      testingDevices: [], // Test device ID
      initializeForTesting: true,
    });

    // ca-app-pub-3940256099942544/5224354917 always test https://developers.google.com/admob/android/rewarded
    // ca-app-pub-1918626353776886/7648248705 ios ad unit id
    // ca-app-pub-1918626353776886/3338302755 android ad unit id

    const options: RewardAdOptions = {
      adId: "ca-app-pub-3940256099942544/5224354917",
    };

    await AdMob.prepareRewardVideoAd(options);
    await AdMob.showRewardVideoAd();
  };

  //
  // Function to handle received messages from the iframe
  //
  function receiveMessage(event: any) {
    // TODO(spicer): Add origin check for added security
    // if (event.origin !== 'http://127.0.0.1:9000') return

    // Check if the message is for us. If not, ignore it.
    if (typeof event.data.action === "undefined") return;

    // Log or use the received message
    //console.log("Received message from child:", event.data, event.origin);

    // Switch based on which action was sent in.
    switch (event.data.action) {
      // Load the reward ad screen
      case "mobile-screen-reward-ad":
        loadRewardAd();
        break;

      // Load the games screen
      case "mobile-screen-games":
        goToGames();
        break;

      // Load the leaderboard screen
      case "mobile-screen-leaderboard":
        goToLeaderboard();
        break;

      // Load the change cause screen
      case "mobile-screen-change-cause":
        alert("mobile-screen-change-cause");
        break;

      // Load the mobile screen get tab desktop screen
      case "mobile-screen-get-tab-desktop":
        alert("mobile-screen-get-tab-desktop");
        break;

      // Load the mobile settings screen
      case "mobile-screen-settings":
        modal.current?.present();
        break;

      // Load logout screen
      case "mobile-screen-logout":
        logOut();
        break;

      default:
        break;
    }
  }

  //
  // Add event listener for messages from the iframe
  //
  useEffect(() => {
    // Add event listener when the component mounts
    window.addEventListener("message", receiveMessage, false);

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      // Subscribe prepared rewardVideo
      console.log("Failed to Loaded:", error);

      presentAlert({
        header: "Ad Load Failed",
        message: "There are no ads at this time. Please try again later.",
        buttons: ["OK"],
      });
    });

    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
      console.log("Loaded:", info);
    });

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
      // Subscribe user rewarded
      console.log("Rewarded", rewardItem);
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <>
      <iframe
        src={process.env.REACT_APP_SERVER + "/v5/mobile/dashboard?access_token=" + userAccessToken}
        frameBorder="0"
        allowFullScreen
        style={{ width: "100%", height: "100%" }}
      ></iframe>

      <IonModal ref={modal} initialBreakpoint={1} breakpoints={[0, 1]} className="settings-modal">
        <IonContent>
          {userAccessToken ? (
            <iframe
              src={process.env.REACT_APP_SERVER + "/v5/mobile/settings?access_token=" + userAccessToken}
              frameBorder="0"
              allowFullScreen
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          ) : (
            "<p>Error: No Access Token. Please kill app and restart.</p>"
          )}
        </IonContent>
      </IonModal>
    </>
  );
};

export default Dashboard;
