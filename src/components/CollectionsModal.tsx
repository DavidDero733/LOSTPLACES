import React, { useState } from 'react';
import { X, Bookmark, Plus, Folder, Eye, Lock, Globe2 } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const CollectionsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    collections,
    locations,
    createCollection,
    flyToLocation,
    selectLocation
  } = useUrbex();

  const [activeCollectionId, setActiveCollectionId] = useState<string>(collections[0]?.id || '');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (activeModal !== 'collections') return null;

  const selectedCol = collections.find((c) => c.id === activeCollectionId) || collections[0];
  const spotsInCollection = selectedCol
    ? locations.filter((loc) => selectedCol.locationIds.includes(loc.id))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    createCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-4 h-4 text-[#22c55e]" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                Archival Collections & Curated Field Dossiers
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                Organize discoveries by theme, region, and structural classification
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg bg-[#18212c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Left Column: Collection List */}
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-[#232b35] p-3 space-y-2 bg-[#0b0f14] overflow-y-auto">
            <div className="flex items-center justify-between px-2 pt-1 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Collections ({collections.length})
              </span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="text-[11px] text-[#22c55e] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreate} className="p-3 bg-[#131a23] border border-[#232e3d] rounded-xl space-y-2 mb-2">
                <input
                  type="text"
                  required
                  placeholder="Collection Title"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0d1217] border border-[#212b38] rounded text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#0d1217] border border-[#212b38] rounded text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-[10px] bg-[#22c55e] text-[#0b0e11] font-semibold rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            {collections.map((col) => {
              const isActive = col.id === activeCollectionId;
              return (
                <button
                  key={col.id}
                  onClick={() => setActiveCollectionId(col.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-colors cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-[#18212c] border-[#22c55e] text-white shadow-sm'
                      : 'bg-[#10151c] border-[#1d2632] text-slate-400 hover:text-slate-200 hover:bg-[#141b24]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-xs truncate">{col.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {col.locationIds.length} locations
                    </div>
                  </div>
                  {col.isPrivate ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  ) : (
                    <Globe2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Spots in this collection */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {selectedCol && (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100">{selectedCol.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Created {selectedCol.createdAt}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedCol.description}</p>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              {spotsInCollection.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <Folder className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p>No locations saved to this collection yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click the bookmark icon on any location card to save it here.
                  </p>
                </div>
              ) : (
                spotsInCollection.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-3 bg-[#131922] border border-[#212b38] hover:border-[#2e3b4d] rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                        <img
                          src={spot.thumbnail}
                          alt={spot.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-100 truncate">{spot.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {spot.city} · {spot.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          flyToLocation(spot);
                          setActiveModal('none');
                        }}
                        className="px-2.5 py-1 text-xs bg-[#19222e] hover:bg-[#202b39] text-slate-200 border border-[#2b394a] rounded-md transition-colors cursor-pointer"
                      >
                        Fly to
                      </button>
                      <button
                        onClick={() => {
                          selectLocation(spot);
                        }}
                        className="px-2.5 py-1 text-xs bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 rounded-md transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
