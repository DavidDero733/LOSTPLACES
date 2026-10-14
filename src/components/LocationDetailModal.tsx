import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  Bookmark, 
  BookmarkCheck, 
  Navigation, 
  Flag, 
  Share2, 
  History, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Send,
  ExternalLink,
  Info,
  Building,
  UserCheck,
  Trash2
} from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';
import { UrbexLocation } from '../types';

export const LocationDetailModal: React.FC = () => {
  const {
    selectedLocation,
    selectLocation,
    toggleSaveLocation,
    isSaved,
    addComment,
    setActiveModal,
    flyToLocation,
    deleteLocation,
    userRole,
    user
  } = useUrbex();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'hazards' | 'history' | 'fieldnotes'>('overview');
  const [commentText, setCommentText] = useState('');
  const [conditionUpdate, setConditionUpdate] = useState('');
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset modal state whenever selected spot changes
  useEffect(() => {
    if (selectedLocation) {
      setActiveImageIdx(0);
      setActiveTab('overview');
      setShowDeleteConfirm(false);
      setCommentText('');
      setConditionUpdate('');
    }
  }, [selectedLocation?.id]);

  if (!selectedLocation) return null;

  const spot = selectedLocation;
  const saved = isSaved(spot.id);

  const allImages = [...spot.images, ...(spot.historicalImages || [])];

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${spot.coordinates.lat}, ${spot.coordinates.lng}`);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(spot.id, commentText.trim(), conditionUpdate.trim() || undefined);
    setCommentText('');
    setConditionUpdate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-[#232b35] flex items-center justify-between gap-4 bg-[#121820]/90 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-[#22c55e] uppercase">
                  {spot.category} · DOSSIER #{spot.id.slice(0, 8)}
                </span>
                {spot.isCommunitySubmitted && (
                  <span className="text-[9px] font-mono bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#4ade80] px-1.5 py-0.2 rounded">
                    COMMUNITY VERIFIED
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate mt-0.5">
                {spot.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Save to Collection */}
            <button
              onClick={() => toggleSaveLocation(spot.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                saved
                  ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                  : 'bg-[#18212c] border-[#293748] text-slate-300 hover:text-white hover:border-slate-500'
              }`}
              title={saved ? 'Remove from Saved' : 'Save to Personal Collection'}
            >
              {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Directions Action */}
            <button
              onClick={() => setActiveModal('directions')}
              className="p-2 rounded-lg bg-[#18212c] border border-[#293748] text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
              title="Viewpoint Routing Directions"
            >
              <Navigation className="w-4 h-4 text-[#38bdf8]" />
            </button>

            {/* Report Issue */}
            <button
              onClick={() => setActiveModal('moderation')}
              className="p-2 rounded-lg bg-[#18212c] border border-[#293748] text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors cursor-pointer"
              title="Report Inaccurate Coordinates or Demolition"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Creator / Owner Delete Action */}
            {(userRole === 'creator' || spot.submittedBy === user.username) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:text-rose-200 hover:bg-rose-900/60 transition-colors cursor-pointer"
                title="Delete Spot (Creator / Owner Tool)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => selectLocation(null)}
              className="p-2 rounded-lg bg-[#18212c] hover:bg-[#202b39] text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="max-w-md w-full p-5 bg-[#14181f] border border-rose-900/70 rounded-2xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <Trash2 className="w-5 h-5 shrink-0" />
                <h3 className="text-sm font-bold text-slate-100">Permanently Delete Spot?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are about to delete <span className="font-semibold text-white">"{spot.name}"</span> ({spot.city}). This action cannot be undone and will remove the site from all maps and collections.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 bg-[#1e2632] hover:bg-[#273242] text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteLocation(spot.id);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Visual Gallery */}
          <div className="relative bg-[#07090c] border-b border-[#232b35]">
            <div className="w-full h-64 sm:h-80 md:h-96 relative overflow-hidden flex items-center justify-center">
              <img
                src={allImages[activeImageIdx] || spot.thumbnail}
                alt={`${spot.name} photography`}
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1217] via-transparent to-black/30 pointer-events-none" />

              {/* Bottom Gallery Floating Meta */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                <button
                  onClick={handleCopyCoords}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:border-[#22c55e] transition-colors cursor-pointer font-mono text-[11px]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>
                    {spot.coordinates.lat.toFixed(4)}, {spot.coordinates.lng.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    {copiedCoords ? '(Copied!)' : '(Copy GPS)'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono">
                  <span>Photo {activeImageIdx + 1}</span>
                  <span>/</span>
                  <span>{allImages.length}</span>
                </div>
              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0e13] overflow-x-auto border-t border-[#1a222c]">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-10 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-[#22c55e] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Tabs (Zero-Pill Segmented Navigation) */}
          <div className="px-6 border-b border-[#232b35] bg-[#0f151c] flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-[#22c55e] text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Field Overview
            </button>
            <button
              onClick={() => setActiveTab('hazards')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'hazards'
                  ? 'border-[#f59e0b] text-amber-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Hazards & Safety Audit</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'border-[#38bdf8] text-sky-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5 text-sky-400" />
              <span>Verified History vs Lore</span>
            </button>
            <button
              onClick={() => setActiveTab('fieldnotes')}
              className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'fieldnotes'
                  ? 'border-[#22c55e] text-white font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Community Field Logs ({spot.comments.length})</span>
            </button>
          </div>

          {/* Tab Content Areas */}
          <div className="p-6">
            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Location Facts Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#141b24] border border-[#232e3d] rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Location</span>
                    <p className="font-semibold text-slate-200 mt-0.5">{spot.city}, {spot.country}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Condition</span>
                    <p className="font-semibold text-amber-400 mt-0.5 capitalize">{spot.condition.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Access Status</span>
                    <p className="font-semibold text-slate-200 mt-0.5 capitalize">{spot.accessStatus.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400">Last Audit</span>
                    <p className="font-mono text-slate-300 mt-0.5">{spot.lastConditionUpdate}</p>
                  </div>
                </div>

                {/* Public Viewpoint & Legal Notice */}
                <div className="p-4 bg-[#16212b]/80 border border-[#233547] rounded-xl flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-slate-100 uppercase tracking-wide">
                      Public Viewpoint & Access Guidelines
                    </span>
                    <p className="text-slate-300 mt-1 leading-relaxed">
                      {spot.publicViewpointDirections}
                    </p>
                    <p className="text-[11px] text-amber-400/90 mt-2 font-mono">
                      * LOSTPLACES strictly discourages unlawful trespassing or vandalism. Respect physical property boundaries.
                    </p>
                  </div>
                </div>

                {/* Brief Summary */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Architectural Summary
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {spot.verifiedHistory}
                  </p>
                </div>

                {/* Tags (Unboxed Text with Separators) */}
                <div className="pt-2 border-t border-[#1e2632]">
                  <span className="text-[11px] font-mono uppercase text-slate-500 mr-2">Archive Tags:</span>
                  <div className="inline-flex flex-wrap gap-2 text-xs text-slate-400">
                    {spot.tags.map((tag, i) => (
                      <React.Fragment key={tag}>
                        <span className="text-slate-300 hover:text-white transition-colors">{tag}</span>
                        {i < spot.tags.length - 1 && <span className="text-slate-600">·</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hazards & Safety Audit */}
            {activeTab === 'hazards' && (
              <div className="space-y-5">
                <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs text-amber-300/90 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300 uppercase tracking-wide">
                      Site Condition & Safety Audit Report
                    </h4>
                    <p className="mt-1 leading-relaxed text-slate-300">
                      Abandoned buildings harbor severe hidden hazards including weakened load-bearing members, hazardous airborne contaminants, open elevator shafts, and active law enforcement patrols.
                    </p>
                  </div>
                </div>

                {/* Detailed Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.structuralInstability 
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Structural Instability / Collapse Risk</span>
                    <span className="font-mono font-bold">{spot.hazards.structuralInstability ? 'HIGH RISK' : 'LOW'}</span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.asbestosOrChemicals 
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Asbestos, Mold & Chemical Residues</span>
                    <span className="font-mono font-bold">{spot.hazards.asbestosOrChemicals ? 'RESPIRATOR REQ.' : 'CLEAR'}</span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.activeSecurityPatrols 
                      ? 'bg-amber-950/20 border-amber-900/50 text-amber-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Active Security / Motion Sensors</span>
                    <span className="font-mono font-bold">{spot.hazards.activeSecurityPatrols ? 'MONITORED' : 'UNPATROLLED'}</span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.floodingOrWaterSubmersion 
                      ? 'bg-sky-950/20 border-sky-900/50 text-sky-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Standing Water / Flooded Basements</span>
                    <span className="font-mono font-bold">{spot.hazards.floodingOrWaterSubmersion ? 'SUBMERGED' : 'DRY'}</span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.hiddenShaftsOrDropOffs 
                      ? 'bg-rose-950/20 border-rose-900/50 text-rose-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Open Shafts & Vertical Drops</span>
                    <span className="font-mono font-bold">{spot.hazards.hiddenShaftsOrDropOffs ? 'EXTREME DANGER' : 'LOW'}</span>
                  </div>

                  <div className={`p-3 rounded-lg border flex items-center justify-between ${
                    spot.hazards.sharpMetalOrGlass 
                      ? 'bg-amber-950/20 border-amber-900/50 text-amber-300' 
                      : 'bg-[#141b24] border-[#222d3b] text-slate-400'
                  }`}>
                    <span>Sharp Metal Debris & Broken Glass</span>
                    <span className="font-mono font-bold">{spot.hazards.sharpMetalOrGlass ? 'HEAVY' : 'MINIMAL'}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#141a22] border border-[#222c38] rounded-xl text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Auditor Notes
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">
                    {spot.hazards.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Verified History vs Rumors */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                {/* Verified Historical Facts */}
                <div className="p-5 bg-[#131b24] border border-[#233142] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-[#38bdf8]">
                    <CheckCircle2 className="w-4 h-4" />
                    <h4 className="text-xs font-bold tracking-wider uppercase font-mono">
                      Verified Archival History
                    </h4>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {spot.verifiedHistory}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-3 pt-3 border-t border-[#1e2a38] font-mono">
                    <span>Constructed: {spot.yearBuilt || 'Circa Early 20th Century'}</span>
                    <span>·</span>
                    <span>Decommissioned: {spot.yearAbandoned || 'Unknown'}</span>
                    <span>·</span>
                    <span className="text-sky-400">Corroborated by State Archives</span>
                  </div>
                </div>

                {/* Community Lore & Rumors (Explicitly Labeled) */}
                <div className="p-5 bg-[#17141f] border border-[#352549] rounded-xl">
                  <div className="flex items-center gap-2 mb-2 text-purple-400">
                    <Info className="w-4 h-4" />
                    <h4 className="text-xs font-bold tracking-wider uppercase font-mono">
                      Community Field Lore & Uncorroborated Claims
                    </h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans italic">
                    "{spot.communityRumorsAndLore || 'No folklore or underground rumors recorded yet for this location.'}"
                  </p>
                  <p className="text-[10px] text-purple-400/80 mt-3 pt-3 border-t border-[#291e38] font-mono">
                    * The above reflects oral explorer lore and rumors; not verified by academic or municipal records.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Community Field Logs & Discussions */}
            {activeTab === 'fieldnotes' && (
              <div className="space-y-5">
                {/* Post New Update Form */}
                <form onSubmit={handlePostComment} className="p-4 bg-[#141b24] border border-[#243142] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      Submit Field Note or Condition Update
                    </span>
                    <span className="text-[10px] font-mono text-[#22c55e]">
                      +25 REP Points
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Brief condition update (e.g. 'North gate welded shut', 'Roof decay in east wing')"
                    value={conditionUpdate}
                    onChange={(e) => setConditionUpdate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1217] border border-[#232d3b] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                  />

                  <textarea
                    rows={3}
                    placeholder="Share your historical observation, photographic notes, or lighting advisory..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1217] border border-[#232d3b] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#22c55e] hover:bg-[#4ade80] disabled:opacity-40 text-[#0b0e11] rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Field Note</span>
                    </button>
                  </div>
                </form>

                {/* Comments Stream */}
                <div className="space-y-3">
                  {spot.comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-[#11161d] border border-[#1e2733] rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{comment.authorName}</span>
                          <span className="text-[10px] font-mono text-[#22c55e]">{comment.authorReputation} REP</span>
                          {comment.isVerifiedExplorer && (
                            <span title="Verified Explorer">
                              <UserCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{comment.date}</span>
                      </div>

                      {comment.conditionStatusReport && (
                        <div className="px-2.5 py-1 bg-amber-950/30 border border-amber-900/40 rounded text-[11px] text-amber-300 font-mono">
                          STATUS REPORT: {comment.conditionStatusReport}
                        </div>
                      )}

                      <p className="text-slate-300 leading-relaxed font-sans">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 px-6 border-t border-[#232b35] bg-[#0f141a] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span>EXPLORATION CODE: TAKE ONLY PHOTOGRAPHS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                flyToLocation(spot);
                selectLocation(null);
              }}
              className="px-3.5 py-1.5 bg-[#18212c] hover:bg-[#222e3d] text-slate-200 rounded-lg border border-[#2b394a] transition-colors cursor-pointer"
            >
              Pan on Map
            </button>
            <button
              onClick={() => selectLocation(null)}
              className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#4ade80] text-[#0b0e11] font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
