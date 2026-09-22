import React from "react";
import ReactDOM from "react-dom/client";
import { SocketProvider } from "../vendorPanel/context/SocketContext";
import App from "./App";
import "./index.css";
import { AdminProvider } from "./context/AdminContext";
import { VendorProvider } from "./context/VendorContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <AdminProvider>
        <VendorProvider>
          <App />
        </VendorProvider>
      </AdminProvider>
    </SocketProvider>
  </React.StrictMode>,
);
