import React from "react";
import ReactDOM from "react-dom/client";

import ErrorBoundary from "./components/ErrorBoundary";

import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>

  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
    }}
  />

  <App />

</ErrorBoundary>
  </React.StrictMode>,
);
