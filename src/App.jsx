import { useState } from "react";
import Header from "./components/Header.jsx";
import HeroSection from "./components/HeroSection.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import LiveRoadMap from "./components/LiveRoadMap.jsx";
import DashboardSections from "./components/DashboardSections.jsx";
import Footer from "./components/Footer.jsx";
import ReportModal from "./components/ReportModal.jsx";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main id="dashboard" className="main-wrap">
        <HeroSection />
        <div className="dashboard-layout">
          <ControlPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenModal={() => setReportModalOpen(true)}
          />
          <div className="map-column">
            <LiveRoadMap searchQuery={searchQuery} />
            <DashboardSections />
          </div>
        </div>
      </main>
      <Footer />
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
}
