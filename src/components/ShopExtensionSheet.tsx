import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonFooter, IonModal } from "@ionic/react";
import { App } from "@capacitor/app";
import { PluginListenerHandle } from "@capacitor/core";
import { ShopExtensionStatus, openShopExtensionSettings } from "../services/shopExtension";
import { logInfo } from "../services/logService";
import "./ShopExtensionSheet.css";

interface ShopExtensionSheetProps {
  isOpen: boolean;
  status: ShopExtensionStatus | null;
  onDismiss: () => void;
  onRefreshStatus: () => Promise<ShopExtensionStatus>;
}

/**
 * Bottom sheet that walks the user through turning on the Shop for a Cause Safari
 * extension. Opened from the dashboard card or the settings row (both in tab-v5).
 *
 * The goal is the fewest possible taps: on iOS 26.2+ one button opens Settings right
 * on the extension, and when the user comes back we re-check and switch to a success
 * screen on our own. Older iOS gets numbered directions instead.
 */
const ShopExtensionSheet: React.FC<ShopExtensionSheetProps> = ({ isOpen, status, onDismiss, onRefreshStatus }) => {
  const [visitedSettings, setVisitedSettings] = useState(false);
  const [confirmedManually, setConfirmedManually] = useState(false);
  const visitedSettingsRef = useRef(false);

  const enabled = !!status?.enabled || confirmedManually;
  const canOpenSettings = !!status?.canOpenSettings;
  const backLabel = (status?.osMajorVersion ?? 0) >= 18 ? "Apps" : "Settings";

  //
  // Re-check the extension when the user comes back from Settings, so the sheet
  // can flip to the success screen without them doing anything.
  //
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let handle: PluginListenerHandle | undefined;
    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive && visitedSettingsRef.current) {
        onRefreshStatus();
      }
    }).then((h) => (handle = h));

    return () => {
      handle?.remove();
    };
  }, [isOpen, onRefreshStatus]);

  //
  // Reset the "came back from Settings" hint each time the sheet opens.
  //
  useEffect(() => {
    if (isOpen) {
      setVisitedSettings(false);
      setConfirmedManually(false);
      visitedSettingsRef.current = false;
      logInfo("Shop for a Cause sheet opened", { enabled: !!status?.enabled });
    }
  }, [isOpen]);

  //
  // Main call to action. Opens Settings (straight to the extension when iOS allows it).
  //
  const handleOpenSettings = async () => {
    visitedSettingsRef.current = true;
    setVisitedSettings(true);
    logInfo("Shop for a Cause sheet opened Settings", { canOpenSettings });
    await openShopExtensionSettings();
  };

  //
  // Older iOS can only tell the extension is on after it has loaded a page, so let
  // the user tell us instead of leaving them stuck on the setup screen.
  //
  const handleConfirmManually = () => {
    setConfirmedManually(true);
    logInfo("Shop for a Cause marked as turned on by user");
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={1} breakpoints={[0, 1]} className="shop-ext-modal">
      <IonContent className="shop-ext-content">
        <button className="shop-ext-close" onClick={onDismiss} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {enabled ? <SuccessView /> : <SetupView canOpenSettings={canOpenSettings} backLabel={backLabel} />}

        {!enabled && visitedSettings && (
          <div className="shop-ext-hint" role="status">
            {canOpenSettings ? (
              <>Not on yet. In Settings, make sure the <strong>Shop for a Cause</strong> switch is green.</>
            ) : (
              <>
                Turned it on?{" "}
                <button className="shop-ext-link" onClick={handleConfirmManually}>
                  Yes, it’s on
                </button>
              </>
            )}
          </div>
        )}
      </IonContent>

      <IonFooter className="shop-ext-footer ion-no-border">
        {enabled ? (
          <button className="shop-ext-primary" onClick={onDismiss}>
            Done
          </button>
        ) : (
          <>
            <button className="shop-ext-primary" onClick={handleOpenSettings}>
              <SettingsGlyph />
              {canOpenSettings ? "Turn on in Settings" : "Open Settings"}
            </button>
            <button className="shop-ext-secondary" onClick={onDismiss}>
              Maybe later
            </button>
          </>
        )}
      </IonFooter>
    </IonModal>
  );
};

/**
 * Pitch plus setup directions, shown until the extension is on.
 */
const SetupView: React.FC<{ canOpenSettings: boolean; backLabel: string }> = ({ canOpenSettings, backLabel }) => (
  <div className="shop-ext-body">
    <HeroArt />

    <p className="shop-ext-eyebrow">New in App for a Cause</p>
    <h1 className="shop-ext-title">Earn more for charity by shopping</h1>
    <p className="shop-ext-lede">
      Turn on Shop for a Cause in Safari. When you buy from a participating store, the store pays a donation to your cause.
    </p>

    <ul className="shop-ext-benefits">
      <Benefit icon="bag" title="Shop where you already shop" text="Works with thousands of stores in Safari." />
      <Benefit icon="heart" title="Free for you" text="Same prices. The store pays, not you." />
      <Benefit icon="bolt" title="Set it up once" text="Takes about 30 seconds." />
    </ul>

    <div className="shop-ext-steps">
      <h2 className="shop-ext-steps-title">{canOpenSettings ? "Two quick steps" : "How to turn it on"}</h2>

      {canOpenSettings ? (
        <ol>
          <li>
            Tap <strong>Turn on in Settings</strong> below.
          </li>
          <li>
            Switch on <strong>Shop for a Cause</strong> and set <strong>All Websites</strong> to <strong>Allow</strong>.
            <SettingsMock />
          </li>
        </ol>
      ) : (
        <ol>
          <li>
            Tap <strong>Open Settings</strong> below.
          </li>
          <li>
            Tap <strong>‹ {backLabel}</strong> at the top, then <strong>Safari</strong>.
          </li>
          <li>
            Tap <strong>Extensions</strong>, then <strong>Shop for a Cause</strong>.
          </li>
          <li>
            Switch it on and set <strong>All Websites</strong> to <strong>Allow</strong>.
            <SettingsMock />
          </li>
        </ol>
      )}
      <p className="shop-ext-steps-foot">Then come back here and we’ll check that it worked.</p>
    </div>
  </div>
);

/**
 * Confirmation once the extension is on, with a reminder of how to use it.
 */
const SuccessView: React.FC = () => (
  <div className="shop-ext-body shop-ext-success">
    <div className="shop-ext-check" aria-hidden="true">
      <svg width="44" height="44" viewBox="0 0 44 44">
        <path d="M12 23l7 7 14-15" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    <h1 className="shop-ext-title">You’re all set!</h1>
    <p className="shop-ext-lede">Shop for a Cause is on. Here’s how to raise money with it:</p>

    <ol className="shop-ext-howto">
      <li>
        <span className="shop-ext-num">1</span>
        <div>
          <strong>Shop in Safari like you normally do.</strong>
          <span>We’ll pop up on stores that donate to your cause.</span>
        </div>
      </li>
      <li>
        <span className="shop-ext-num">2</span>
        <div>
          <strong>Tap Activate before you check out.</strong>
          <span>That’s what sends the donation to your cause.</span>
        </div>
      </li>
      <li>
        <span className="shop-ext-num">3</span>
        <div>
          <strong>Buy as usual.</strong>
          <span>Same price for you. The store pays the donation.</span>
        </div>
      </li>
    </ol>

    <p className="shop-ext-tip">
      Don’t see it on a store? Make sure <strong>All Websites</strong> is set to <strong>Allow</strong> in Settings › Apps › Safari ›
      Extensions › Shop for a Cause.
    </p>
  </div>
);

/**
 * One row in the benefits list.
 */
const Benefit: React.FC<{ icon: "bag" | "heart" | "bolt"; title: string; text: string }> = ({ icon, title, text }) => (
  <li>
    <span className={`shop-ext-benefit-icon shop-ext-icon-${icon}`} aria-hidden="true">
      {icon === "bag" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12l1 13H5L6 7z" />
          <path d="M9 7a3 3 0 016 0" />
        </svg>
      )}
      {icon === "heart" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
        </svg>
      )}
      {icon === "bolt" && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
        </svg>
      )}
    </span>
    <div>
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  </li>
);

/**
 * A drawn version of the Settings screen the user is about to see, so they know
 * exactly what to tap without us maintaining real screenshots.
 */
const SettingsMock: React.FC = () => (
  <div className="shop-ext-mock" aria-hidden="true">
    <div className="shop-ext-mock-row">
      <span className="shop-ext-mock-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" />
        </svg>
      </span>
      <span className="shop-ext-mock-label">Shop for a Cause</span>
      <span className="shop-ext-mock-toggle">
        <span />
      </span>
    </div>
    <div className="shop-ext-mock-row">
      <span className="shop-ext-mock-label">All Websites</span>
      <span className="shop-ext-mock-value">Allow ›</span>
    </div>
  </div>
);

/**
 * Hero illustration: a shopping bag with a heart, on the brand gradient.
 */
const HeroArt: React.FC = () => (
  <div className="shop-ext-hero" aria-hidden="true">
    <svg width="118" height="100" viewBox="0 0 132 112">
      <circle cx="18" cy="30" r="5" fill="#FF47BF" opacity=".55" />
      <circle cx="116" cy="22" r="7" fill="#9747FF" opacity=".35" />
      <circle cx="112" cy="86" r="4" fill="#FF47BF" opacity=".45" />
      <circle cx="24" cy="88" r="3" fill="#9747FF" opacity=".5" />
      <path d="M40 38h52l4 62H36l4-62z" fill="url(#bag)" />
      <path d="M54 38v-6a12 12 0 0124 0v6" fill="none" stroke="#7A2EE6" strokeWidth="5" strokeLinecap="round" />
      <path d="M66 86s-14-8.6-14-19a8 8 0 0114-5.2A8 8 0 0180 67c0 10.4-14 19-14 19z" fill="#fff" />
      <defs>
        <linearGradient id="bag" x1="36" y1="38" x2="96" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B276FF" />
          <stop offset="1" stopColor="#9747FF" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

/**
 * Small gear glyph for the Settings button.
 */
const SettingsGlyph: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
  </svg>
);

export default ShopExtensionSheet;
