import { useState } from "react";
import { useSearch } from "./hooks/useSearch.js";
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
  const { results, loading, error, searched, search, clear } = useSearch();

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) clear();
  };

  const handleSearchSubmit = (query) => {
    if (query.trim()) search(query);
  };

  return (
    <>
      <Header />
      <main id="dashboard" className="main-wrap">
        <HeroSection />
        <div className="dashboard-layout">
          <ControlPanel
            searchQuery={searchQuery}
            setSearchQuery={handleSearch}
            onOpenModal={() => setReportModalOpen(true)}
            searchResults={results}
            searching={loading}
            searched={searched}
            onClear={clear}
            onSearchSubmit={handleSearchSubmit}
          />
          <div className="map-column">
            <LiveRoadMap searchQuery={searchQuery} searchResults={results} searched={searched} />
            <DashboardSections />
          </div>
        </div>
      </main>
      <Footer />
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </>
  );
}