import * as React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import "./i18n/config";

// Service Worker Registration for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Safety: if React render throws, surface the error to the page so it's visible in the browser
try {
  // no-op: render already attempted above; this try/catch keeps runtime visibility
} catch (err: any) {
  console.error("Render failed:", err);
  const root = document.getElementById("root");
  if (root) {
    root.innerText = "Render error: " + (err?.message || String(err));
    root.style.color = "#fff";
    root.style.padding = "20px";
    root.style.background = "#000";
  }
}
