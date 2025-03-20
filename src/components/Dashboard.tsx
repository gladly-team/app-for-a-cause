import React, { useEffect, useRef } from "react";
import { useIonRouter, useIonAlert, IonModal, IonContent } from "@ionic/react";
import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem, AdMobError, AdmobConsentStatus } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";
import SelectCause from "./SelectCause";
import { getUrlPostFix } from "../services/url";
import "./Dashboard.css";

interface DashboardProps {
  logOut: () => void;
  onDeleteUser: () => void;
  userAccessToken: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userAccessToken, logOut, onDeleteUser }) => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const selectCauseModal = useRef<HTMLIonModalElement>(null);
  const desktopEmailModal = useRef<HTMLIonModalElement>(null);
  const [presentAlert] = useIonAlert();

  // Handle cause selection
  const handleCauseSelect = () => {
    // Close the modal when cause selection is successful
    selectCauseModal.current?.dismiss();
  };

  // Open select cause modal and hide settings modal
  const openSelectCauseModal = () => {
    // Dismiss settings modal if it's open
    modal.current?.dismiss();
    // Present select cause modal
    selectCauseModal.current?.present();
  };

  // Open desktop email modal and hide settings modal
  const openDesktopEmailModal = () => {
    // Dismiss settings modal if it's open
    modal.current?.dismiss();
    // Present desktop email modal
    desktopEmailModal.current?.present();
  };

  //
  // Get the user's mobile OS
  //
  const getMobileOS = () => {
    if (Capacitor.getPlatform() === "android") {
      return "android";
    } else if (Capacitor.getPlatform() === "ios") {
      return "ios";
    }
    return "unknown";
  };

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
  // Set the background color and status bar style
  //
  const setupAdMob = async () => {
    await AdMob.initialize({
      testingDevices: [], // Test device ID "2b52fe5b325742d5e15188c02e146927"
      initializeForTesting: false,
    });

    const [trackingInfo, consentInfo] = await Promise.all([AdMob.trackingAuthorizationStatus(), AdMob.requestConsentInfo()]);

    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      const { status } = await AdMob.showConsentForm();
    }

    if (trackingInfo.status === "notDetermined") {
      await AdMob.requestTrackingAuthorization();
    }
  };

  //
  // This is called when the user clicks on the reward ad button.
  //
  const loadRewardAd = async () => {
    // Initialize AdMob
    setupAdMob();

    // Set the ad ID based on the mobile OS
    let adId = "ca-app-pub-3940256099942544/5224354917";

    if (getMobileOS() === "android") {
      adId = "ca-app-pub-1918626353776886/3338302755";
    }

    // Spicer's iPhone: E0AA4EF0-531E-4C89-8BDB-905F5EB5DCB2
    // ca-app-pub-3940256099942544/5224354917 always test https://developers.google.com/admob/android/rewarded
    // ca-app-pub-1918626353776886/7648248705 ios ad unit id
    // ca-app-pub-1918626353776886/3338302755 android ad unit id

    const options: RewardAdOptions = {
      adId: adId,
    };

    await AdMob.prepareRewardVideoAd(options);
    await AdMob.showRewardVideoAd();
  };

  //
  // Handle account deletion
  //
  const handleAccountDeletion = async () => {
    // The alert will be closed automatically before this function is executed

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER}/v5/api/user`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userAccessToken}`,
        },
      });

      console.log("Response: ", response.ok);

      if (response.ok) {
        // If deletion is successful, log the user out
        onDeleteUser();
      } else {
        // Show error alert with a small delay to ensure UI is ready
        setTimeout(() => {
          presentAlert({
            header: "Error",
            message: "Failed to delete account. Please try again later.",
            buttons: ["OK"],
          });
        }, 300);
      }
    } catch (error) {
      console.error("Error deleting account:", error);

      // Show error alert with a small delay to ensure UI is ready
      setTimeout(() => {
        presentAlert({
          header: "Error",
          message: "An unexpected error occurred. Please try again later.",
          buttons: ["OK"],
        });
      }, 300);
    }
  };

  //
  // Show confirmation dialog for account deletion
  //
  const confirmAccountDeletion = () => {
    presentAlert({
      header: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone.",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          role: "destructive",
          handler: handleAccountDeletion,
        },
      ],
    });
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
        openSelectCauseModal();
        break;

      // Load the mobile screen get tab desktop screen
      case "mobile-screen-get-tab-desktop":
        openDesktopEmailModal();
        break;

      // Load the mobile settings screen
      case "mobile-screen-settings":
        modal.current?.present();
        break;

      // Handle account deletion request
      case "account-delete":
        confirmAccountDeletion();
        break;

      // Load logout screen
      case "mobile-screen-logout":
        logOut();
        break;

      default:
        break;
    }
  }

  // //
  // Called when the component changes.
  //
  useEffect(() => {
    // Show the status bar
    //showStatusBar();
  });

  //
  // Add event listener for messages from the iframe
  //
  useEffect(() => {
    // Set the background color and status bar style
    //setBackgroundColor();

    // Add event listener when the component mounts
    window.addEventListener("message", receiveMessage, false);

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: AdMobError) => {
      // Subscribe prepared rewardVideo
      console.log("Failed to Loaded:", error);

      presentAlert({
        header: "Watch a video, raise money for charity!",
        message: "No videos available right now, please check back later.",
        buttons: ["OK"],
      });
    });

    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
      console.log("Loaded:", info);
    });

    // Called after the ad is watched
    AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
      fetch(`${process.env.REACT_APP_SERVER}/v5/mobile/video-ad-rewarded?access_token=${userAccessToken}&${getUrlPostFix()}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => console.log("Video ad rewarded acknowledged:", data))
        .catch((error) => console.error("Error acknowledging video ad reward:", error));
    });

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
    <>
      <iframe
        src={`${process.env.REACT_APP_SERVER}/v5/mobile/dashboard?access_token=${userAccessToken}&mobile_os=${getMobileOS()}&${getUrlPostFix()}`}
        frameBorder="0"
        allowFullScreen
        style={{ width: "100%", height: "100%" }}
      ></iframe>

      <IonModal ref={modal} initialBreakpoint={1} breakpoints={[0, 1]} className="settings-modal">
        <IonContent>
          {userAccessToken ? (
            <iframe
              src={`${process.env.REACT_APP_SERVER}/v5/mobile/settings?access_token=${userAccessToken}&mobile_os=${getMobileOS()}&${getUrlPostFix()}`}
              frameBorder="0"
              allowFullScreen
              style={{ width: "100%", height: "100%" }}
            ></iframe>
          ) : (
            "<p>Error: No Access Token. Please kill app and restart.</p>"
          )}
        </IonContent>
      </IonModal>

      <IonModal ref={selectCauseModal} initialBreakpoint={1} breakpoints={[0, 1]} className="select-cause-modal" style={{ height: "100%" }}>
        <IonContent style={{ height: "100%" }}>
          <SelectCause userAccessToken={userAccessToken} onCauseSelect={handleCauseSelect} />
        </IonContent>
      </IonModal>

      <IonModal ref={desktopEmailModal} initialBreakpoint={1} breakpoints={[0, 1]} className="desktop-email-modal">
        <IonContent>
          {userAccessToken ? (
            <iframe
              src={`${process.env.REACT_APP_SERVER}/v5/mobile/desktop-email?access_token=${userAccessToken}&mobile_os=${getMobileOS()}&${getUrlPostFix()}`}
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
