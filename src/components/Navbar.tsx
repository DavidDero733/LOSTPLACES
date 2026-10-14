import React from 'react';
import { Compass, Plus, Bookmark, ShieldAlert, User, ShieldCheck, Sparkles, Globe, Crown } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const Navbar: React.FC = () => {
  const { 
    user, 
    setActiveModal, 
    viewMode, 
    setViewMode, 
    reports,
    setPinDropMode,
    userRole,
    setUserRole,
    jumpToRandomSpot
  } = useUrbex();

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <header className="h-16 border-b border-[#232b35] bg-[#0f141a]/95 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between gap-4 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a 
          href="#explore" 
          onClick={(e) => { e.preventDefault(); setViewMode('map'); }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#16202a] border border-[#2e3b4a] flex items-center justify-center text-[#22c55e] group-hover:border-[#22c55e]/50 transition-colors shadow-inner">
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-widest text-slate-100 uppercase font-sans">
              LOST<span className="text-[#22c55e]">PLACES</span>
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 font-mono -mt-1 uppercase">
              Field Archive · Open Access
            </span>
          </div>
        </a>

        {/* Zero API Key Assurance Pill */}
        <div 
          onClick={() => setActiveModal('cartography')}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131922] border border-[#222c39] hover:border-[#22c55e]/40 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
          title="OpenStreetMap & CartoDB tiles — Zero API keys required"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span>Zero API Key Required</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className={`hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer ${
            viewMode === 'map' ? 'text-slate-200 font-semibold' : ''
          }`}
        >
          {viewMode === 'map' ? 'Map Explorer' : 'Directory View'}
        </button>

        <button
          onClick={() => setActiveModal('collections')}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          <span>Collections</span>
        </button>

        <button
          onClick={() => setActiveModal('safety')}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer text-amber-400/80 hover:text-amber-300"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Safety Code</span>
        </button>

        <button
          onClick={() => setActiveModal('moderation')}
          className="flex items-center gap-1.5 hover:text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Audit Feed</span>
          {pendingReportsCount > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800">
              {pendingReportsCount}
            </span>
          )}
        </button>
      </nav>

      {/* Zone 3: Actions (Surprise spot, Mode Switcher, Primary Submit CTA + Profile) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Random Discovery Button (Easier to find hidden spots) */}
        <button
          onClick={jumpToRandomSpot}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141b24] hover:bg-[#1a2330] border border-[#232e3d] text-slate-300 hover:text-[#4ade80] rounded-lg text-xs transition-colors cursor-pointer"
          title="Surprise Discovery: Teleport to a random abandoned site worldwide"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
          <span className="hidden lg:inline text-[11px] font-medium">Random Spot</span>
        </button>

        {/* Mode Switcher: 👑 Creator vs 🕶️ Guest vs 👤 Member */}
        <div className="flex items-center p-0.5 bg-[#121820] border border-[#232b35] rounded-lg text-[11px] font-mono">
          <button
            onClick={() => setUserRole('creator')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              userRole === 'creator'
                ? 'bg-[#22c55e]/20 text-[#4ade80] font-bold border border-[#22c55e]/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Creator Mode: Delete spots, backup database, and manage archive"
          >
            <Crown className="w-3 h-3 text-[#22c55e]" />
            <span className="hidden sm:inline">Creator</span>
          </button>

          <button
            onClick={() => setUserRole('guest')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              userRole === 'guest'
                ? 'bg-sky-950/60 text-sky-300 font-bold border border-sky-800 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Guest Mode: 100% anonymous browsing without any account"
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">Guest</span>
          </button>
        </div>

        {/* Submit Spot CTA */}
        <button
          onClick={() => {
            setPinDropMode(false);
            setActiveModal('submit');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0b0e11] bg-[#22c55e] hover:bg-[#4ade80] active:scale-[0.98] transition-all rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Submit Spot</span>
        </button>

        {/* Profile Button */}
        <button
          onClick={() => setActiveModal('profile')}
          className="flex items-center gap-2 p-1 pl-2 bg-[#13181e] hover:bg-[#1a222a] border border-[#232b35] hover:border-[#2e3b4a] rounded-lg transition-colors cursor-pointer group"
          title="Explorer Profile & Settings"
        >
          <div className="hidden sm:flex flex-col items-end leading-none pr-1">
            <span className="text-[11px] font-medium text-slate-200 group-hover:text-white transition-colors">
              {userRole === 'creator' ? '👑 Lead Archivist' : userRole === 'guest' ? '🕶️ Guest Explorer' : user.username}
            </span>
            <span className="text-[10px] font-mono text-[#22c55e] tabular-nums">
              {userRole === 'creator' ? 'CREATOR' : userRole === 'guest' ? 'ANONYMOUS' : `${user.reputation} REP`}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 border border-slate-700/80 shrink-0">
            <img 
              src={user.avatar} 
              alt={user.displayName} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
