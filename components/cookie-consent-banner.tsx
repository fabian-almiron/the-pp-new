"use client";

import CookieConsent from "react-cookie-consent";

export function CookieConsentBanner() {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
      enableDeclineButton
      cookieName="pipedPeonyCookieConsent"
      style={{
        background: "#2B373B",
        padding: "20px",
      }}
      buttonStyle={{
        background: "#C4A574",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "4px",
        padding: "10px 30px",
        marginRight: "10px",
      }}
      declineButtonStyle={{
        background: "transparent",
        border: "1px solid #C4A574",
        color: "#C4A574",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "4px",
        padding: "10px 30px",
      }}
      expires={365}
    >
      This website uses cookies to enhance your browsing experience and provide personalized content.{" "}
      <a href="/privacy-policy" style={{ color: "#C4A574", textDecoration: "underline" }}>
        Learn more
      </a>
    </CookieConsent>
  );
}

