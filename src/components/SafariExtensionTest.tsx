import React, { useState } from "react";
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonLabel } from "@ionic/react";
import { SafariExtensionService } from "../services/safariExtension";
import { Capacitor } from "@capacitor/core";

/**
 * Test component for Safari extension installation
 * This component provides buttons to test the Safari extension functionality
 * Remove or hide this component in production
 */
const SafariExtensionTest: React.FC = () => {
  const [extensionStatus, setExtensionStatus] = useState<boolean | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string>("");

  /**
   * Handle install button click
   */
  const handleInstallClick = async () => {
    try {
      const success = await SafariExtensionService.installExtension();
      setLastActionResult(success ? "Extension preferences opened successfully" : "Failed to open extension preferences");
    } catch (error) {
      setLastActionResult(`Error: ${error}`);
    }
  };

  /**
   * Check if extension is enabled
   */
  const handleCheckStatus = async () => {
    try {
      const enabled = await SafariExtensionService.isExtensionEnabled();
      setExtensionStatus(enabled);
      setLastActionResult(`Extension is ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      setLastActionResult(`Error checking status: ${error}`);
      setExtensionStatus(null);
    }
  };

  /**
   * Simulate iframe message for testing
   */
  const simulateIframeMessage = () => {
    window.postMessage(
      {
        action: "install-safari-extension",
      },
      "*"
    );
    setLastActionResult("Simulated iframe message sent");
  };

  /**
   * Simulate check status message from iframe
   */
  const simulateCheckStatusMessage = () => {
    window.postMessage(
      {
        action: "check-safari-extension",
      },
      "*"
    );
    setLastActionResult("Simulated check status message sent");
  };

  const isIOS = Capacitor.getPlatform() === "ios";

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Safari Extension Test</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <IonChip color={isIOS ? "success" : "danger"}>
            <IonLabel>Platform: {Capacitor.getPlatform()}</IonLabel>
          </IonChip>

          {extensionStatus !== null && (
            <IonChip color={extensionStatus ? "success" : "warning"}>
              <IonLabel>Extension: {extensionStatus ? "Enabled" : "Disabled"}</IonLabel>
            </IonChip>
          )}

          <IonButton expand="block" onClick={handleInstallClick} disabled={!isIOS}>
            Open Safari Extension Settings
          </IonButton>

          <IonButton expand="block" onClick={handleCheckStatus} disabled={!isIOS}>
            Check Extension Status
          </IonButton>

          <IonButton expand="block" color="secondary" onClick={simulateIframeMessage}>
            Simulate Iframe Install Message
          </IonButton>

          <IonButton expand="block" color="secondary" onClick={simulateCheckStatusMessage}>
            Simulate Iframe Check Message
          </IonButton>

          {lastActionResult && (
            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px" }}>
              <strong>Result:</strong> {lastActionResult}
            </div>
          )}

          <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "5px" }}>
            <strong>Note:</strong> This test component only works on iOS devices. The Safari extension installation will open the Settings app where
            users can enable the extension.
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default SafariExtensionTest;