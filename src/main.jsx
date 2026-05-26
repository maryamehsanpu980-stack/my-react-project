import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardSections from './DashboardSections';
import Contributor from './Contributor';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardSections />} />
        {/* The :page param makes the URL dynamic, defaulting to page 1 if not provided */}
        <Route path="/contributors/:page" element={<Contributor />} />
      </Routes>
      <App/>
    </BrowserRouter>
  </React.StrictMode>
);
