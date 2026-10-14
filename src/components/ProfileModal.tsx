import React from 'react';
import { X, Award, Shield, MapPin, Bookmark, User, Compass, Crown, Globe, Download, Upload, RotateCcw } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const ProfileModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    user, 
    locations, 
    selectLocation,
    userRole,
    setUserRole,
    exportDatabaseJson,
    restoreDefaultSpots
  } = useUrbex();

  if (activeModal !== 'profile') return null;

  const savedSpots = locations.filter((loc) => user.savedLocationIds.includes(loc.id));
  const submittedSpots = locations.filter((loc) => user.submittedSpotIds.includes(loc.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#22c55e]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Explorer Identity & Roles
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg bg-[#18212c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Identity Lockup */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border-2 border-[#22c55e]/60 shrink-0">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  {userRole === 'creator' ? 'Lead Archivist (Creator)' : userRole === 'guest' ? 'Anonymous Guest' : user.displayName}
                </h3>
                <span className="text-xs font-mono text-[#22c55e]">
                  {userRole === 'creator' ? '👑 CREATOR' : userRole === 'guest' ? '🕶️ GUEST' : `@${user.username}`}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {userRole === 'guest' 
                  ? 'Browsing anonymously. No accounts, cookies, or personal tracking used.' 
                  : user.bio}
              </p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                <span>Joined {user.memberSince}</span>
                <span>·</span>
                <span className="text-[#22c55e] font-semibold">{user.reputation} REP</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Block */}
          <div className="p-4 bg-[#141b24] border border-[#232e3d] rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Operational Access Mode
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => setUserRole('creator')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  userRole === 'creator'
                    ? 'bg-[#18261e] border-[#22c55e] text-white shadow'
                    : 'bg-[#11171f] border-[#212b37] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[#4ade80] mb-0.5">
                  <Crown className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Creator</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">Delete spots, export database, manage all pins</div>
              </button>

              <button
                onClick={() => setUserRole('member')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  userRole === 'member'
                    ? 'bg-[#18232f] border-[#38bdf8] text-white shadow'
                    : 'bg-[#11171f] border-[#212b37] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-0.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Explorer</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">Standard account, badges, collections</div>
              </button>

              <button
                onClick={() => setUserRole('guest')}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                  userRole === 'guest'
                    ? 'bg-[#211a2f] border-purple-500 text-white shadow'
                    : 'bg-[#11171f] border-[#212b37] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-0.5">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>Guest</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">100% anonymous, zero login or keys</div>
              </button>
            </div>
          </div>

          {/* Creator Utilities Box */}
          {userRole === 'creator' && (
            <div className="p-4 bg-[#141b24] border border-[#232e3d] rounded-xl space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4ade80] font-bold block">
                Creator Database Controls
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={exportDatabaseJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18232f] hover:bg-[#202e3e] text-slate-200 border border-[#2d3a4d] rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Export Database JSON</span>
                </button>
                <button
                  onClick={restoreDefaultSpots}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18232f] hover:bg-[#202e3e] text-slate-300 border border-[#2d3a4d] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>Restore Default Spots</span>
                </button>
              </div>
            </div>
          )}

          {/* Badges Grid */}
          <div className="p-4 bg-[#141b24] border border-[#232e3d] rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Contribution & Credibility Badges
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {user.badges.map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a232f] border border-[#2d3a4d] rounded-md text-xs text-slate-200"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submitted Spots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Discovered & Documented Sites ({submittedSpots.length})
              </span>
            </div>
            {submittedSpots.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No community submissions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {submittedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => {
                      selectLocation(spot);
                      setActiveModal('detail');
                    }}
                    className="p-2.5 bg-[#121820] hover:bg-[#18212c] border border-[#222c38] rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Compass className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span className="text-xs font-bold text-slate-200">{spot.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{spot.city}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Spots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Bookmarked Field Sites ({savedSpots.length})
              </span>
            </div>
            <div className="space-y-2">
              {savedSpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    selectLocation(spot);
                    setActiveModal('detail');
                  }}
                  className="p-2.5 bg-[#121820] hover:bg-[#18212c] border border-[#222c38] rounded-lg flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200">{spot.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{spot.city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
