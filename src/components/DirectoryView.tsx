import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Bookmark, 
  BookmarkCheck, 
  Eye, 
  Navigation,
  Compass,
  ArrowRight,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

export const DirectoryView: React.FC = () => {
  const {
    filteredLocations,
    selectLocation,
    flyToLocation,
    toggleSaveLocation,
    isSaved,
    setViewMode,
    deleteLocation,
    userRole,
    user,
    userCoords,
    mapCenter
  } = useUrbex();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refCoords = userCoords || { lat: mapCenter[0], lng: mapCenter[1] };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0b0e11] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#232b35] pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#22c55e] uppercase">
              ARCHIVAL CATALOGUE · LISTING VIEW
            </span>
            {userRole === 'creator' && (
              <span className="text-[9px] font-mono bg-[#22c55e]/20 text-[#4ade80] px-2 py-0.5 rounded font-bold border border-[#22c55e]/40">
                👑 CREATOR DELETION POWER ENABLED
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Documented Historical Sites & Field Reports ({filteredLocations.length})
          </h2>
        </div>

        <button
          onClick={() => setViewMode('map')}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#141b24] hover:bg-[#1a2330] border border-[#232e3d] text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Compass className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Switch to Interactive Map</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLocations.map((spot) => {
          const saved = isSaved(spot.id);
          const isConfirmingDelete = confirmDeleteId === spot.id;
          const distKm = calculateDistanceKm(refCoords.lat, refCoords.lng, spot.coordinates.lat, spot.coordinates.lng);

          return (
            <article
              key={spot.id}
              className="group bg-[#11161d] border border-[#222b37] hover:border-[#2f3d4e] rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between relative"
            >
              {isConfirmingDelete ? (
                <div className="p-6 bg-rose-950/80 border border-rose-800 rounded-2xl space-y-3 m-2 animate-fadeIn flex flex-col justify-center h-full">
                  <div className="text-sm font-bold text-rose-200 flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Permanently delete "{spot.name}"?</span>
                  </div>
                  <p className="text-xs text-rose-300/80">
                    This location will be erased from all maps, databases, and saved collections.
                  </p>
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 bg-[#1a222e] text-slate-300 rounded-lg text-xs hover:bg-[#232f3f] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        deleteLocation(spot.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-lg"
                    >
                      Delete Spot
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    {/* Photo Banner */}
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={spot.thumbnail}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11161d] via-transparent to-black/20 pointer-events-none" />

                      {/* Top tags & Action icons */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-mono uppercase text-slate-200 border border-white/10">
                          {spot.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Creator / Owner Delete Button */}
                          {(userRole === 'creator' || spot.submittedBy === user.username) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(spot.id);
                              }}
                              className="p-1.5 bg-rose-950/80 backdrop-blur-md rounded-lg text-rose-300 hover:text-white border border-rose-800/80 transition-colors cursor-pointer"
                              title="Delete spot (Creator Tool)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveLocation(spot.id);
                            }}
                            className="p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                            title={saved ? 'Remove bookmark' : 'Bookmark location'}
                          >
                            {saved ? <BookmarkCheck className="w-3.5 h-3.5 text-[#22c55e]" /> : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
                        <span className="text-white font-bold">{spot.city}, {spot.country}</span>
                        <span>{formatDistance(distKm)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-slate-100 group-hover:text-[#4ade80] transition-colors leading-tight">
                        {spot.name}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {spot.verifiedHistory}
                      </p>

                      {/* Hazard snippet */}
                      <div className="p-2.5 bg-[#161d26] border border-[#232d3b] rounded-lg text-[11px] text-amber-300/90 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{spot.hazards.notes || spot.condition.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 pt-2 border-t border-[#1d2633] flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        flyToLocation(spot);
                        setViewMode('map');
                      }}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#22c55e]" />
                      <span>View on Map</span>
                    </button>

                    <button
                      onClick={() => selectLocation(spot)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18212c] hover:bg-[#212c3b] border border-[#2d3a4b] text-slate-200 font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      <span>Field Dossier</span>
                      <ArrowRight className="w-3 h-3 text-[#22c55e]" />
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
