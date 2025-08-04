/**
 * Facebook Pixel utility for tracking conversions and events
 * Only initializes on web platform to avoid issues with native apps
 */

import { Capacitor } from '@capacitor/core';
import ReactPixel from 'react-facebook-pixel';

/**
 * Interface for Facebook Pixel event data
 * Contains all standard Facebook Pixel parameters
 */
export interface EventData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  predicted_ltv?: number;
  status?: boolean;
  search_string?: string;
  registration_method?: string;
  [key: string]: any;
}

/**
 * Facebook Pixel ID - Replace with actual pixel ID
 * TODO: Move this to environment configuration for security
 */
const FACEBOOK_PIXEL_ID = '[REPLACE_WITH_ACTUAL_PIXEL_ID]';

/**
 * Check if we're in development mode
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if Facebook Pixel is initialized
 */
let isInitialized = false;

/**
 * Initialize Facebook Pixel
 * Only runs on web platform, skips initialization on native platforms
 */
export const initFacebookPixel = (): void => {
  try {
    // Only initialize on web platform
    const platform = Capacitor.getPlatform();
    if (platform !== 'web') {
      if (isDevelopment) {
        console.log(`[Facebook Pixel] Skipping initialization on ${platform} platform`);
      }
      // TODO: Implement native Facebook SDK for iOS/Android platforms
      return;
    }

    // Initialize pixel
    ReactPixel.init(FACEBOOK_PIXEL_ID, undefined, {
      autoConfig: true,
      debug: isDevelopment,
    });

    isInitialized = true;

    if (isDevelopment) {
      console.log('[Facebook Pixel] Initialized successfully');
      console.log('[Facebook Pixel] Test with Facebook Pixel Helper Chrome extension');
    }
  } catch (error) {
    console.error('[Facebook Pixel] Initialization error:', error);
  }
};

/**
 * Track a Facebook Pixel event
 * @param event - The event name to track
 * @param data - Optional event data
 */
export const trackEvent = (event: string, data?: EventData): void => {
  try {
    // Only track on web platform
    const platform = Capacitor.getPlatform();
    if (platform !== 'web' || !isInitialized) {
      if (isDevelopment) {
        console.log(`[Facebook Pixel] Event '${event}' not tracked - Platform: ${platform}, Initialized: ${isInitialized}`);
      }
      return;
    }

    // Track the event
    ReactPixel.track(event, data);

    if (isDevelopment) {
      console.log(`[Facebook Pixel] Event tracked: ${event}`, data);
    }
  } catch (error) {
    console.error(`[Facebook Pixel] Error tracking event '${event}':`, error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (): void => {
  try {
    // Only track on web platform
    const platform = Capacitor.getPlatform();
    if (platform !== 'web' || !isInitialized) {
      return;
    }

    ReactPixel.pageView();

    if (isDevelopment) {
      console.log('[Facebook Pixel] Page view tracked');
    }
  } catch (error) {
    console.error('[Facebook Pixel] Error tracking page view:', error);
  }
};

/**
 * Track Complete Registration event
 * Called when user finishes signup
 * @param data - Optional registration data
 */
export const trackCompleteRegistration = (data?: EventData): void => {
  trackEvent('CompleteRegistration', data);
};

/**
 * Track Purchase event
 * Called when user makes a purchase
 * @param value - Purchase value
 * @param currency - Currency code (e.g., 'USD')
 * @param additionalData - Additional purchase data
 */
export const trackPurchase = (value: number, currency = 'USD', additionalData?: EventData): void => {
  trackEvent('Purchase', {
    value,
    currency,
    ...additionalData,
  });
};

/**
 * Track Activate App event
 * Called on first app open/activation
 */
export const trackActivateApp = (): void => {
  trackEvent('ActivateApp');
};

/**
 * Track Add Payment Info event
 * Called when user adds payment method
 * @param data - Optional payment info data
 */
export const trackAddPaymentInfo = (data?: EventData): void => {
  trackEvent('AddPaymentInfo', data);
};

/**
 * Track View Content event
 * Called when user views important content
 * @param contentName - Name of the content viewed
 * @param contentCategory - Category of the content
 * @param additionalData - Additional content data
 */
export const trackViewContent = (
  contentName: string,
  contentCategory?: string,
  additionalData?: EventData
): void => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
    ...additionalData,
  });
};

/**
 * Track Initiate Checkout event
 * Called when user starts checkout process
 * @param value - Checkout value
 * @param currency - Currency code (e.g., 'USD')
 * @param additionalData - Additional checkout data
 */
export const trackInitiateCheckout = (
  value?: number,
  currency = 'USD',
  additionalData?: EventData
): void => {
  trackEvent('InitiateCheckout', {
    value,
    currency,
    ...additionalData,
  });
};

/**
 * Track custom event
 * For events not covered by standard events
 * @param eventName - Custom event name
 * @param data - Event data
 */
export const trackCustomEvent = (eventName: string, data?: EventData): void => {
  trackEvent(eventName, data);
};