import React, { useEffect, useRef, useState } from "react";
import { useIonRouter, useIonAlert, IonModal, IonContent, IonButton } from "@ionic/react";
import { AdMob, RewardAdOptions, RewardAdPluginEvents, AdLoadInfo, AdMobRewardItem, AdMobError, AdmobConsentStatus } from "@capacitor-community/admob";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import SelectCause from "./SelectCause";
import { getUrlPostFix } from "../services/url";
import { logInfo, logError, logDebug } from "../services/logService";
import { BranchService } from "../services/branch";
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
  const youtubeVideoModal = useRef<HTMLIonModalElement>(null);
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
  // Open YouTube video modal
  //
  const openYoutubeVideoModal = () => {
    youtubeVideoModal.current?.present();
  };

  //
  // Close YouTube video modal
  //
  const closeYoutubeVideoModal = () => {
    youtubeVideoModal.current?.dismiss();
  };

  // //
  // // Handle generating a referral link
  // //
  // const handleGenerateReferralLink = async (userId: string, username?: string) => {
  //   try {
  //     logInfo("Generating referral link", { userId, username });
  //     const link = await BranchService.createReferralLink(userId, username);

  //     // Send the generated link back to the iframe
  //     const iframe = document.querySelector("iframe");
  //     if (iframe && iframe.contentWindow) {
  //       iframe.contentWindow.postMessage({
  //         action: "referral-link-generated",
  //         link
  //       }, "*");
  //       logDebug("Sent referral link to iframe", { link });
  //     }
  //   } catch (error) {
  //     logError("Failed to generate referral link", { error: String(error) });
  //     presentAlert({
  //       header: "Error",
  //       message: "Failed to generate referral link. Please try again.",
  //       buttons: ["OK"],
  //     });
  //   }
  // };

  // //
  // // Handle sharing a referral link
  // //
  // const handleShareReferralLink = async (userId: string, username?: string) => {
  //   try {
  //     logInfo("Sharing referral link", { userId, username });
  //     await BranchService.shareReferralLink(userId, username);
  //     logDebug("Referral link shared successfully");
  //   } catch (error) {
  //     logError("Failed to share referral link", { error: String(error) });
  //     presentAlert({
  //       header: "Error",
  //       message: "Failed to share referral link. Please try again.",
  //       buttons: ["OK"],
  //     });
  //   }
  // };

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
    logInfo("User requested to watch a reward ad");

    // // Initialize AdMob
    // setupAdMob();

    // Set the ad ID based on the mobile OS
    let adId = "ca-app-pub-1918626353776886/7648248705";

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

    try {
      await AdMob.prepareRewardVideoAd(options);
      await AdMob.showRewardVideoAd();
      logInfo("Reward ad successfully shown");
    } catch (error) {
      logError("Failed to show reward ad", { error: String(error) });

      // Send message to the child iframe that the video ad has loaded
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: "video-ad-loaded" }, "*");
        logDebug("Sent video-ad-loaded message to iframe");
      }

      // Show YouTube video modal instead when ad fails to load
      openYoutubeVideoModal();
    }
  };

  //
  // Handle account deletion
  //
  const handleAccountDeletion = async () => {
    // The alert will be closed automatically before this function is executed
    logInfo("User initiated account deletion");

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
        logInfo("Account deletion successful");
        onDeleteUser();
      } else {
        // Show error alert with a small delay to ensure UI is ready
        logError("Account deletion failed - server returned error", {
          status: response.status,
          statusText: response.statusText,
        });

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

      logError("Account deletion failed - exception", {
        error: String(error),
        stack: (error as Error).stack,
      });

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
  // To open a dynamic page, send: { action: "mobile-open-page", url: "https://example.com/page", title: "Page Title" }
  // To open an external URL, send: { action: "mobile-open-external-url", url: "https://example.com" }
  //
  function receiveMessage(event: any) {
    // TODO(spicer): Add origin check for added security
    // if (event.origin !== 'http://127.0.0.1:9000') return

    // Check if the message is for us. If not, ignore it.
    if (typeof event.data.action === "undefined") return;

    // Log or use the received message
    // console.log("Received message from child:", event.data, event.origin);

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

      // // Generate referral link
      // case "mobile-generate-referral-link":
      //   handleGenerateReferralLink(event.data.userId, event.data.username);
      //   break;

      // // Share referral link
      // case "mobile-share-referral-link":
      //   handleShareReferralLink(event.data.userId, event.data.username);
      //   break;

      // Generic page navigation with dynamic iframe URL
      case "mobile-open-page":
        if (event.data.url && event.data.title) {
          // Store the page info in localStorage for the Page component to use
          localStorage.setItem("forward-page-iframe-url", event.data.url);
          localStorage.setItem("forward-page-title", event.data.title);
          localStorage.setItem("forward-page-access-token", userAccessToken);
          localStorage.setItem("forward-page-no-refresh", "true");

          // Navigate to the Page component
          router.push("/page");

          logDebug("Opening dynamic page", {
            url: event.data.url,
            title: event.data.title,
          });
        } else {
          logError("Missing required data for mobile-open-page", {
            data: event.data,
          });
        }
        break;

      // Open external URL in system browser
      case "mobile-open-external-url":
        if (event.data.url) {
          Browser.open({
            url: event.data.url,
          })
            .then(() => {
              logDebug("Opened external URL", {
                url: event.data.url,
              });
            })
            .catch((error: any) => {
              logError("Failed to open external URL", {
                url: event.data.url,
                error: error.message || error,
              });
            });
        } else {
          logError("Missing required URL for mobile-open-external-url", {
            data: event.data,
          });
        }
        break;

      default:
        break;
    }
  }

  //
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
      logError("Reward ad failed to load", { errorCode: error.code, errorMessage: error.message });

      // presentAlert({
      //   header: "Watch a video, raise money for charity!",
      //   message: "No videos available right now, please check back later.",
      //   buttons: ["OK"],
      // });

      // Show YouTube video modal instead of alert
      openYoutubeVideoModal();
    });

    AdMob.addListener(RewardAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared rewardVideo
      console.log("Loaded:", info);
      logDebug("Reward ad loaded successfully", { adUnitId: info.adUnitId });

      // Send message to the child iframe that the video ad has loaded
      const iframe = document.querySelector("iframe");
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ action: "video-ad-loaded" }, "*");
        logDebug("Sent video-ad-loaded message to iframe");
      }
    });

    // Called after the ad is watched
    AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem: AdMobRewardItem) => {
      logInfo("User rewarded for watching ad", {
        type: rewardItem.type,
        amount: rewardItem.amount,
      });

      fetch(`${process.env.REACT_APP_SERVER}/v5/mobile/video-ad-rewarded?access_token=${userAccessToken}&${getUrlPostFix()}`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Video ad rewarded acknowledged:", data);
          logInfo("Video ad reward acknowledged by server", { data });
        })
        .catch((error) => {
          console.error("Error acknowledging video ad reward:", error);
          logError("Failed to acknowledge video ad reward", { error: String(error) });
        });
    });

    // Initialize AdMob
    setupAdMob();

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

      {/* Video Modal */}
      <IonModal ref={youtubeVideoModal} initialBreakpoint={1} breakpoints={[0, 1]} className="youtube-video-modal">
        <IonContent style={{ "--background": "#000000" }}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div className="video-container" style={{ width: "100%", maxWidth: "800px" }}>
              <video width="100%" controls autoPlay playsInline style={{ maxWidth: "100%" }} src="https://s3.us-west-2.amazonaws.com/blog.gladly.io/TabforTreesShort.mov">
                Your browser does not support the video tag.
              </video>
            </div>
            <IonButton onClick={closeYoutubeVideoModal} style={{ marginTop: "20px" }}>
              Close
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </>
  );
};

export default Dashboard;
