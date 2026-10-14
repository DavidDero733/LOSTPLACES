import React from 'react';
import { UrbexProvider, useUrbex } from './context/UrbexContext';
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { DiscoverySidebar } from './components/DiscoverySidebar';
import { DirectoryView } from './components/DirectoryView';
import { LocationDetailModal } from './components/LocationDetailModal';
import { SpotSubmissionModal } from './components/SpotSubmissionModal';
import { CollectionsModal } from './components/CollectionsModal';
import { ProfileModal } from './components/ProfileModal';
import { SafetyCodeModal } from './components/SafetyCodeModal';
import { DirectionsModal } from './components/DirectionsModal';
import { ModerationModal } from './components/ModerationModal';
import { CartographyModal } from './components/CartographyModal';

const MainLayout: React.FC = () => {
  const { viewMode, toastMessage } = useUrbex();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0e11] text-[#e2e8f0]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#121820]/95 border border-[#22c55e] text-slate-100 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-fadeIn font-sans text-xs select-none">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
          <span className="font-semibold text-[#4ade80]">{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Discovery Sidebar (Left) */}
        <DiscoverySidebar />

        {/* Dynamic Center Stage: Map or Directory Grid */}
        <div className="flex-1 relative h-full overflow-hidden flex flex-col">
          {viewMode === 'map' ? (
            <MapComponent />
          ) : (
            <DirectoryView />
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      <LocationDetailModal />
      <SpotSubmissionModal />
      <CollectionsModal />
      <ProfileModal />
      <SafetyCodeModal />
      <DirectionsModal />
      <ModerationModal />
      <CartographyModal />
    </div>
  );
};

export default function App() {
  return (
    <UrbexProvider>
      <MainLayout />
    </UrbexProvider>
  );
}
