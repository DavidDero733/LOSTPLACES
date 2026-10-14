import React, { useState, useRef } from 'react';
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Users, 
  SlidersHorizontal,
  Compass,
  Building,
  Activity,
  Shield,
  Layers,
  Train,
  Church,
  Eye,
  Trash2,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Navigation,
  Star,
  CheckCircle2,
  Lock,
  Globe2
} from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';
import { CITY_HUBS } from '../data/mockSpots';
import { CategoryType, ConditionType, SortOption } from '../types';
import { calculateDistanceKm, formatDistance } from '../utils/geo';

const CATEGORIES: { id: CategoryType | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Compass className="w-3.5 h-3.5" /> },
  { id: 'industrial', label: 'Industrial', icon: <Building className="w-3.5 h-3.5" /> },
  { id: 'medical', label: 'Medical', icon: <Activity className="w-3.5 h-3.5" /> },
  { id: 'military', label: 'Military', icon: <Shield className="w-3.5 h-3.5" /> },
  { id: 'subterranean', label: 'Subterranean', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'transit', label: 'Transit', icon: <Train className="w-3.5 h-3.5" /> },
  { id: 'religious', label: 'Religious', icon: <Church className="w-3.5 h-3.5" /> },
];

export const DiscoverySidebar: React.FC = () => {
  const {
    filteredLocations,
    locations,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCondition,
    setSelectedCondition,
    selectedCity,
    setSelectedCity,
    showCommunityOnly,
    setShowCommunityOnly,
    showMySubmissionsOnly,
    setShowMySubmissionsOnly,
    minRating,
    setMinRating,
    sortOption,
    setSortOption,
    maxDistanceKm,
    setMaxDistanceKm,
    user,
    selectedLocation,
    selectLocation,
    flyToLocation,
    flyToCity,
    viewMode,
    setViewMode,
    deleteLocation,
    userRole,
    setUserRole,
    exportDatabaseJson,
    importDatabaseJson,
    restoreDefaultSpots,
    jumpToRandomSpot,
    resetAllFilters,
    locateUser,
    userCoords,
    mapCenter,
    setActiveModal,
    setPinDropMode
  } = useUrbex();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showCreatorDeck, setShowCreatorDeck] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active filter count for badge
  const activeFiltersCount = 
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCondition !== 'all' ? 1 : 0) +
    (selectedCity !== null ? 1 : 0) +
    (showCommunityOnly ? 1 : 0) +
    (showMySubmissionsOnly ? 1 : 0) +
    (minRating !== null ? 1 : 0) +
    (maxDistanceKm !== null ? 1 : 0) +
    (searchQuery.trim().length > 0 ? 1 : 0);

  // City spot counter helper
  const getCityCount = (cityName: string) => {
    return locations.filter(l => l.city.toLowerCase().includes(cityName.toLowerCase())).length;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importDatabaseJson(content);
        }
      };
      reader.readAsText(file);
    }
  };

  // Instant search suggestions (top 5 matching spots)
  const searchSuggestions = searchQuery.trim()
    ? locations.filter(loc => {
        const q = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          loc.tags.some(t => t.toLowerCase().includes(q))
        );
      }).slice(0, 5)
    : [];

  return (
    <aside
      className={`relative z-20 flex flex-col bg-[#0b0e11]/95 md:bg-[#0f141a]/95 backdrop-blur-xl border-r border-[#232b35] transition-all duration-300 h-full select-none ${
        isCollapsed ? 'w-14' : 'w-full md:w-[420px] lg:w-[460px]'
      }`}
    >
      {/* Hidden file input for database import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportFile} 
        accept=".json" 
        className="hidden" 
      />

      {/* Collapse Toggle Handle (Desktop only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3.5 top-20 z-30 w-7 h-7 rounded-full bg-[#16202a] border border-[#2e3b4a] hover:border-[#22c55e] text-slate-300 items-center justify-center shadow-lg transition-colors cursor-pointer"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* When Collapsed View */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-6 gap-6">
          <div className="w-8 h-8 rounded-lg bg-[#16202a] flex items-center justify-center text-[#22c55e]">
            <Compass className="w-4 h-4" />
          </div>
          <span className="[writing-mode:vertical-rl] text-xs font-mono tracking-widest text-slate-400 uppercase">
            LOSTPLACES SURVEY
          </span>
          <div className="mt-auto text-[10px] font-mono text-slate-500">
            {filteredLocations.length}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Marquee & Tagline */}
          <div className="px-5 pt-3.5 pb-2.5 border-b border-[#232b35]/70 bg-gradient-to-b from-[#141a22] to-[#0f141a]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest text-[#22c55e] font-semibold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
                <span>LOSTPLACES FIELD ARCHIVE</span>
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                <span className="text-white font-bold tabular-nums">{filteredLocations.length}</span>
                <span>/</span>
                <span className="tabular-nums">{locations.length}</span>
                <span className="text-slate-400">sites</span>
              </div>
            </div>

            {/* City Hub Quick Jumps with spot counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-2 mt-1 no-scrollbar">
              <button
                onClick={() => setSelectedCity(null)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCity === null
                    ? 'bg-[#22c55e] text-[#0b0e11] font-bold shadow-sm'
                    : 'bg-[#16202a] text-slate-300 hover:bg-[#1f2a37] border border-[#232b35]'
                }`}
              >
                All Regions ({locations.length})
              </button>
              {CITY_HUBS.map((hub) => {
                const count = getCityCount(hub.name);
                const isSelected = selectedCity === hub.name;
                return (
                  <button
                    key={hub.name}
                    onClick={() => flyToCity(hub)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#22c55e] text-[#0b0e11] font-bold shadow-sm'
                        : 'bg-[#16202a] text-slate-300 hover:bg-[#1f2a37] border border-[#232b35]'
                    }`}
                  >
                    <span>{hub.name}</span>
                    <span className={`text-[9px] px-1 rounded font-mono ${
                      isSelected ? 'bg-black/20 text-[#0b0e11]' : 'bg-[#0f141a] text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guest Mode Banner (if in guest mode) */}
          {userRole === 'guest' && (
            <div className="px-4 py-2 bg-sky-950/40 border-b border-sky-900/50 flex items-center justify-between text-xs text-sky-200 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="text-[11px]"><strong>Guest Mode:</strong> Anonymous browsing, zero tracking, no API keys.</span>
              </div>
              <button
                onClick={() => setUserRole('creator')}
                className="text-[10px] font-bold text-sky-300 hover:text-white underline cursor-pointer ml-2 whitespace-nowrap"
              >
                Creator Tools
              </button>
            </div>
          )}

          {/* Creator Admin Deck Ribbon (When Creator Mode Active) */}
          {userRole === 'creator' && (
            <div className="px-4 py-2 bg-[#17201c] border-b border-[#22c55e]/30 flex flex-col gap-1.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#4ade80] font-mono text-[11px] font-bold">
                  <span>👑 CREATOR TOOLS</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300 font-sans font-normal text-[10px]">Delete, backup, & manage</span>
                </div>
                <button
                  onClick={() => setShowCreatorDeck(!showCreatorDeck)}
                  className="text-[10px] text-slate-300 hover:text-[#4ade80] font-mono cursor-pointer"
                >
                  {showCreatorDeck ? 'Hide Options ▲' : 'Deck Controls ▼'}
                </button>
              </div>

              {showCreatorDeck && (
                <div className="pt-1.5 pb-1 flex flex-wrap items-center gap-2 border-t border-[#22c55e]/20 text-xs">
                  <button
                    onClick={() => {
                      setPinDropMode(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#22c55e] text-[#0b0e11] font-bold rounded text-[11px] hover:bg-[#4ade80] transition-colors cursor-pointer"
                    title="Click anywhere on the map to add a pin"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Drop Pin on Map</span>
                  </button>

                  <button
                    onClick={exportDatabaseJson}
                    className="flex items-center gap-1 px-2 py-1 bg-[#16222f] hover:bg-[#1e2e3f] text-slate-200 border border-[#2b3c4e] rounded text-[10px] transition-colors cursor-pointer"
                    title="Export archive to a JSON backup file"
                  >
                    <Download className="w-3 h-3 text-[#38bdf8]" />
                    <span>Backup JSON</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2 py-1 bg-[#16222f] hover:bg-[#1e2e3f] text-slate-200 border border-[#2b3c4e] rounded text-[10px] transition-colors cursor-pointer"
                    title="Import spots from JSON file"
                  >
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>Import JSON</span>
                  </button>

                  <button
                    onClick={restoreDefaultSpots}
                    className="flex items-center gap-1 px-2 py-1 bg-[#16222f] hover:bg-[#1e2e3f] text-slate-300 border border-[#2b3c4e] rounded text-[10px] transition-colors cursor-pointer"
                    title="Restore default archival locations"
                  >
                    <RotateCcw className="w-3 h-3 text-[#22c55e]" />
                    <span>Restore Defaults</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Search & Category Filter Section */}
          <div className="p-4 border-b border-[#232b35] flex flex-col gap-3 bg-[#0d1117] relative">
            {/* Search Input with Live Dropdown */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ruins, cities, factories, coordinates, tags..."
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#141a22] border border-[#242f3d] rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22c55e] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Live Instant Search Suggestions Dropdown */}
              {searchFocused && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#121820] border border-[#283648] rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-[#1e2836]">
                  <div className="px-3 py-1.5 bg-[#0f141a] text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Instant Match ({searchSuggestions.length})</span>
                    <span>Click to jump</span>
                  </div>
                  {searchSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onMouseDown={() => {
                        flyToLocation(item);
                        selectLocation(item);
                      }}
                      className="p-2.5 hover:bg-[#18222d] transition-colors cursor-pointer flex items-center gap-3"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-9 h-9 rounded object-cover bg-slate-800 shrink-0 border border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <span className="text-[#22c55e]">{item.city}</span>
                          <span>·</span>
                          <span className="capitalize">{item.category}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Segmented Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1e2733] text-white border border-[#3b4959] shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141a22]'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Filter Presets Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {/* Community toggle */}
                <button
                  onClick={() => {
                    setShowCommunityOnly(!showCommunityOnly);
                    if (!showCommunityOnly) setShowMySubmissionsOnly(false);
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    showCommunityOnly 
                      ? 'bg-[#22c55e]/15 border-[#22c55e] text-[#4ade80] font-bold' 
                      : 'bg-[#121820] border-[#222c39] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {showCommunityOnly ? '✓ Community Added' : 'Community Added'}
                </button>

                {/* Rating 4.5+ */}
                <button
                  onClick={() => setMinRating(minRating ? null : 4.5)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    minRating 
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold' 
                      : 'bg-[#121820] border-[#222c39] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>4.5+ Stars</span>
                </button>

                {/* Locate / Nearest */}
                <button
                  onClick={locateUser}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    sortOption === 'closest' && userCoords
                      ? 'bg-sky-950/50 border-sky-500 text-sky-300 font-bold'
                      : 'bg-[#121820] border-[#222c39] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Navigation className="w-3 h-3 text-[#22c55e]" />
                  <span>Nearest</span>
                </button>
              </div>

              {/* Advanced filter toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer shrink-0 ml-2 ${
                  showAdvancedFilters || activeFiltersCount > 0 ? 'text-[#22c55e] font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
              </button>
            </div>

            {/* Advanced Filters Expandable Deck */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-[#1e2632] space-y-2.5 animate-fadeIn">
                {/* Sort selector */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Sort By:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-2 py-1 bg-[#141b24] border border-[#232f3f] rounded text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="recent">Newest Surveyed</option>
                    <option value="closest">Distance (Nearest First)</option>
                    <option value="rating">Highest Rated</option>
                    <option value="abandoned">Oldest Abandoned (Year)</option>
                  </select>
                </div>

                {/* Distance range */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Distance Radius:</span>
                  <div className="flex items-center gap-1">
                    {[
                      { val: null, label: 'Global' },
                      { val: 50, label: '50 km' },
                      { val: 250, label: '250 km' },
                      { val: 1000, label: '1000 km' },
                    ].map((d) => (
                      <button
                        key={d.label}
                        onClick={() => setMaxDistanceKm(d.val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                          maxDistanceKm === d.val
                            ? 'bg-[#22c55e]/20 border-[#22c55e] text-[#4ade80] font-bold'
                            : 'bg-[#121820] border-[#222c39] text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition filter pills */}
                <div className="space-y-1">
                  <span className="font-mono text-slate-400 text-[11px]">Site Condition:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'decayed', 'ruins', 'overgrown', 'demolition_risk', 'partially_preserved'] as const).map(
                      (cond) => (
                        <button
                          key={cond}
                          onClick={() => setSelectedCondition(cond)}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors cursor-pointer ${
                            selectedCondition === cond
                              ? 'bg-[#22c55e]/15 border-[#22c55e] text-[#4ade80] font-semibold'
                              : 'bg-[#13181e] border-[#232b35] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cond.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Reset all button */}
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="w-full py-1 text-center text-xs text-rose-400 hover:text-rose-300 font-semibold bg-rose-950/20 border border-rose-900/40 rounded transition-colors cursor-pointer"
                  >
                    Clear All Filters ({activeFiltersCount})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Location Cards Scrollable List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLocations.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#16202a] border border-[#232b35] flex items-center justify-center text-slate-500 mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-slate-300">No abandoned sites matched</span>
                <span className="text-xs text-slate-500 mt-1 max-w-xs">
                  Try clearing your search query or broadening the distance filter.
                </span>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-3.5 py-1.5 text-xs bg-[#1e2632] hover:bg-[#253040] text-slate-200 rounded-lg transition-colors cursor-pointer border border-[#2d3a4b]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredLocations.map((spot) => {
                const isSelected = selectedLocation?.id === spot.id;
                const isConfirmingDelete = confirmDeleteId === spot.id;

                // Calculate distance if coordinates available
                const ref = userCoords || { lat: mapCenter[0], lng: mapCenter[1] };
                const distKm = calculateDistanceKm(ref.lat, ref.lng, spot.coordinates.lat, spot.coordinates.lng);

                return (
                  <article
                    key={spot.id}
                    onClick={() => {
                      flyToLocation(spot);
                    }}
                    className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer bg-[#12171e]/90 hover:bg-[#161e27] ${
                      isSelected
                        ? 'border-[#22c55e] shadow-lg shadow-[#22c55e]/5 ring-1 ring-[#22c55e]/30'
                        : 'border-[#222b37] hover:border-[#2f3c4c]'
                    }`}
                  >
                    {/* Delete Confirmation Box for Creator/Owner */}
                    {isConfirmingDelete ? (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg space-y-2 animate-fadeIn"
                      >
                        <div className="text-xs font-bold text-rose-200 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Permanently delete "{spot.name}"?</span>
                        </div>
                        <p className="text-[11px] text-rose-300/80">
                          This spot will be removed from all maps and collections immediately.
                        </p>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 bg-[#1a222e] text-slate-300 rounded text-xs hover:bg-[#232f3f] cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              deleteLocation(spot.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-xs cursor-pointer shadow"
                          >
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-3.5">
                          {/* Photo Thumbnail */}
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 border border-[#232b35] shrink-0 relative">
                            <img
                              src={spot.thumbnail}
                              alt={spot.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            {spot.isCommunitySubmitted && (
                              <div className="absolute top-1 left-1 px-1 py-0.2 bg-[#22c55e]/90 text-[#0b0e11] font-mono text-[9px] font-bold rounded">
                                COMMUNITY
                              </div>
                            )}
                          </div>

                          {/* Content & Metadata */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="text-xs font-bold text-slate-100 group-hover:text-[#4ade80] transition-colors truncate leading-snug">
                                  {spot.name}
                                </h3>

                                {/* Creator Mode Direct Delete Icon */}
                                {(userRole === 'creator' || spot.submittedBy === user.username) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(spot.id);
                                    }}
                                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                                    title="Delete this spot (Creator Tool)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Unboxed Metadata */}
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                                <span className="font-mono text-slate-300 uppercase">{spot.city}</span>
                                <span aria-hidden="true">·</span>
                                <span className="capitalize">{spot.category}</span>
                                {spot.yearAbandoned && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="font-mono">Ab. {spot.yearAbandoned}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Distance & Hazard summary */}
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-[#1c242e]">
                              <div className="flex items-center gap-1 text-amber-400/90 truncate max-w-[190px]">
                                <AlertTriangle className="w-3 h-3 shrink-0" />
                                <span className="truncate">{spot.condition.replace('_', ' ')}</span>
                              </div>

                              <div className="flex items-center gap-2 font-mono text-slate-400">
                                <span>{formatDistance(distKm)}</span>
                                <span className="text-[#22c55e] font-semibold">{spot.rating.toFixed(1)} ★</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectLocation(spot);
                          }}
                          className="mt-2.5 w-full py-1.5 px-3 bg-[#18212c] hover:bg-[#202c3b] text-slate-300 hover:text-white text-[11px] font-medium rounded-lg border border-[#283545] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-[#22c55e]" />
                          <span>Inspect Field Dossier</span>
                        </button>
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
