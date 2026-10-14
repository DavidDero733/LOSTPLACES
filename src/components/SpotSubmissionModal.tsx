import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Crosshair, 
  AlertTriangle, 
  Check, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Globe2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Camera,
  Layers,
  Building
} from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';
import { CategoryType, ConditionType, AccessStatusType, PrecisionType } from '../types';

export const SpotSubmissionModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    addLocation,
    pinDropMode,
    setPinDropMode,
    pendingPinCoords,
    setPendingPinCoords,
    mapCenter,
    selectedCity,
    setToastMessage
  } = useUrbex();

  // Active step tab (1 to 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('industrial');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('United States');
  const [lat, setLat] = useState<string>(mapCenter[0].toFixed(5));
  const [lng, setLng] = useState<string>(mapCenter[1].toFixed(5));
  const [precision, setPrecision] = useState<PrecisionType>('exact');
  const [condition, setCondition] = useState<ConditionType>('decayed');
  const [accessStatus, setAccessStatus] = useState<AccessStatusType>('strict_trespass_risk');
  const [publicViewpointDirections, setPublicViewpointDirections] = useState('');
  const [verifiedHistory, setVerifiedHistory] = useState('');
  const [communityRumorsAndLore, setCommunityRumorsAndLore] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Hazards checklist
  const [hazards, setHazards] = useState({
    structuralInstability: true,
    asbestosOrChemicals: false,
    activeSecurityPatrols: false,
    floodingOrWaterSubmersion: false,
    sharpMetalOrGlass: true,
    hiddenShaftsOrDropOffs: false,
    extremeDarkness: false,
    notes: '',
  });

  // When pending coordinates arrive from pin clicking on map
  useEffect(() => {
    if (pendingPinCoords) {
      setLat(pendingPinCoords.lat.toFixed(5));
      setLng(pendingPinCoords.lng.toFixed(5));
    }
  }, [pendingPinCoords]);

  // If mapCenter changes and coordinates are untouched, sync initial
  useEffect(() => {
    if (!pendingPinCoords && (!lat || lat === '0.00000')) {
      setLat(mapCenter[0].toFixed(5));
      setLng(mapCenter[1].toFixed(5));
    }
  }, [mapCenter]);

  // Keep modal in DOM if user is in pin-drop mode so draft state is 100% preserved!
  if (activeModal !== 'submit' && !pinDropMode) {
    return null;
  }

  const handlePickOnMap = () => {
    setPinDropMode(true);
  };

  const executeSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Please give this site a name (e.g. Abandoned Silo, Old Iron Works).');
      setStep(1);
      return;
    }

    // If city is empty, intelligently default to the active city filter or "Local Area"
    const finalCity = city.trim() || selectedCity || 'Local Exploration';

    setValidationError(null);

    const parsedLat = parseFloat(lat) || mapCenter[0];
    const parsedLng = parseFloat(lng) || mapCenter[1];

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const created = addLocation({
        name: trimmedName,
        category,
        city: finalCity,
        region: region.trim(),
        country: country.trim() || 'Global',
        coordinates: { lat: parsedLat, lng: parsedLng },
        precision,
        condition,
        accessStatus,
        hazards,
        publicViewpointDirections: publicViewpointDirections.trim() || 'Viewable from adjacent public roadway, sidewalk, or perimeter trail.',
        verifiedHistory: verifiedHistory.trim() || 'Survey record documented by local explorer. Physical architecture verified on site.',
        communityRumorsAndLore: communityRumorsAndLore.trim() || '',
        images: photoUrl.trim() ? [photoUrl.trim()] : [
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'
        ],
        thumbnail: photoUrl.trim() || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        tags: tags.length > 0 ? tags : ['Community Added', 'Recent Survey'],
      });

      // Reset form draft for next discovery
      setName('');
      setCity('');
      setRegion('');
      setVerifiedHistory('');
      setPublicViewpointDirections('');
      setCommunityRumorsAndLore('');
      setPhotoUrl('');
      setTagsInput('');
      setStep(1);
      setPendingPinCoords(null);
      setPinDropMode(false);
    } catch (err) {
      console.error('Error adding location:', err);
      setToastMessage('Error saving location. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSave();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn ${
        pinDropMode ? 'hidden pointer-events-none' : ''
      }`}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-[#22c55e] uppercase">
                DOCUMENT DISCOVERY · STEP {step} OF 4
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                · AUTO-SAVES TO DATABASE
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100 mt-0.5">
              Submit an Abandoned Location
            </h2>
          </div>
          <button
            onClick={() => {
              setPendingPinCoords(null);
              setPinDropMode(false);
              setActiveModal('none');
            }}
            className="p-1.5 rounded-lg bg-[#18212c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-6 border-b border-[#232b35] bg-[#0b0f14] flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs">
          {[
            { id: 1, label: '1. Essentials (Name & Pin)' },
            { id: 2, label: '2. History & Lore' },
            { id: 3, label: '3. Hazard Checklist' },
            { id: 4, label: '4. Photos & Tags' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                step === s.id
                  ? 'bg-[#1e2733] text-[#4ade80] border border-[#22c55e]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Quick Save Hint Ribbon */}
        <div className="px-6 py-2 bg-[#121922] border-b border-[#1f2834] flex items-center justify-between text-[11px] text-slate-300">
          <span>⚡ You can click <strong>Save & Publish Discovery</strong> at any time! Other fields are optional.</span>
          <button
            type="button"
            onClick={executeSave}
            className="px-2.5 py-1 bg-[#22c55e] text-[#0b0e11] font-bold rounded text-[11px] hover:bg-[#4ade80] transition-colors cursor-pointer"
          >
            Instant Save
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: Basic Location & Coordinates */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Packard Plant Detroit, Sanatorium Belvedere, Old Grain Mill"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                  >
                    <option value="industrial">Industrial / Factory</option>
                    <option value="medical">Medical / Sanatorium</option>
                    <option value="military">Military / Radar / Bunker</option>
                    <option value="subterranean">Subterranean / Tunnel</option>
                    <option value="residential">Residential / Manor</option>
                    <option value="religious">Religious / Cathedral</option>
                    <option value="transit">Transit / Rail / Port</option>
                    <option value="leisure">Leisure / Theme Park</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    City or Region
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Detroit, Berlin, Paris (or leave blank for Local)"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                  />
                </div>
              </div>

              {/* Coordinates & Pin Picker */}
              <div className="p-3.5 bg-[#141b24] border border-[#232e3d] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      Geographic GPS Coordinates
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Current map position or click "Pick Pin on Map"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePickOnMap}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#22c55e]/15 text-[#4ade80] hover:bg-[#22c55e]/25 border border-[#22c55e]/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#22c55e]" />
                    <span>Pick Pin on Map</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-0.5">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0d1217] border border-[#232d3b] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-0.5">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0d1217] border border-[#232d3b] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Precision selector */}
                <div className="pt-2 border-t border-[#1e2632] space-y-1.5">
                  <span className="text-[11px] text-slate-400 font-mono">Location Privacy:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrecision('exact')}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        precision === 'exact'
                          ? 'bg-[#1e2733] border-[#22c55e] text-white'
                          : 'bg-[#11171f] border-[#212b37] text-slate-400'
                      }`}
                    >
                      <Globe2 className="w-3.5 h-3.5 mb-1 text-[#22c55e]" />
                      <div className="font-semibold text-[11px]">Exact Public</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrecision('approximate')}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        precision === 'approximate'
                          ? 'bg-[#1e2733] border-[#22c55e] text-white'
                          : 'bg-[#11171f] border-[#212b37] text-slate-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 mb-1 text-sky-400" />
                      <div className="font-semibold text-[11px]">Approx. Radius</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrecision('members_only')}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        precision === 'members_only'
                          ? 'bg-[#1e2733] border-[#22c55e] text-white'
                          : 'bg-[#11171f] border-[#212b37] text-slate-400'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 mb-1 text-amber-400" />
                      <div className="font-semibold text-[11px]">Members Only</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: History & Description */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Historical Background & Architecture
                </label>
                <textarea
                  rows={4}
                  placeholder="Architectural style, operating era, former industry, year shuttered, reasons for abandonment..."
                  value={verifiedHistory}
                  onChange={(e) => setVerifiedHistory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Public Viewpoint Directions
                </label>
                <textarea
                  rows={2}
                  placeholder="Where can viewers legally see or photograph this structure from public rights-of-way?"
                  value={publicViewpointDirections}
                  onChange={(e) => setPublicViewpointDirections(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Community Lore & Urban Legends (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Local explorer rumors, myths, or historical oddities..."
                  value={communityRumorsAndLore}
                  onChange={(e) => setCommunityRumorsAndLore(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Hazards & Safety Audit */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs text-amber-300/90 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mark known physical hazards present at this site:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { key: 'structuralInstability', label: 'Structural Instability / Collapse Risk' },
                  { key: 'asbestosOrChemicals', label: 'Asbestos, Mold & Chemical Residues' },
                  { key: 'activeSecurityPatrols', label: 'Active Security / Motion Sensors' },
                  { key: 'floodingOrWaterSubmersion', label: 'Submerged Floors / Flooding' },
                  { key: 'sharpMetalOrGlass', label: 'Sharp Metal & Broken Glass' },
                  { key: 'hiddenShaftsOrDropOffs', label: 'Open Pit Shafts & Vertical Drops' },
                  { key: 'extremeDarkness', label: 'Total Subterranean Darkness' },
                ].map(({ key, label }) => {
                  const checked = (hazards as any)[key];
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        checked
                          ? 'bg-[#18212c] border-[#22c55e] text-slate-100'
                          : 'bg-[#11171f] border-[#212b37] text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setHazards((prev) => ({ ...prev, [key]: e.target.checked }))
                        }
                        className="rounded text-[#22c55e] focus:ring-0"
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Specific Hazard Advisory Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Respirator recommended due to toxic mold spores"
                  value={hazards.notes}
                  onChange={(e) => setHazards((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Current Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ConditionType)}
                    className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100"
                  >
                    <option value="decayed">Decayed (Weathered)</option>
                    <option value="ruins">Ruins (Partial Collapse)</option>
                    <option value="overgrown">Overgrown by Nature</option>
                    <option value="demolition_risk">Active Demolition Risk</option>
                    <option value="partially_preserved">Partially Preserved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Access Status
                  </label>
                  <select
                    value={accessStatus}
                    onChange={(e) => setAccessStatus(e.target.value as AccessStatusType)}
                    className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100"
                  >
                    <option value="public_viewpoint_only">Public Viewpoint Only</option>
                    <option value="strict_trespass_risk">Strict Trespass Risk</option>
                    <option value="unrestricted_perimeter">Unrestricted Perimeter</option>
                    <option value="guided_historical_tours">Guided Historical Tours</option>
                    <option value="extreme_structural_danger">Extreme Structural Danger</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Photography & Tags */}
          {step === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Photo URL (Optional — defaults to atmospheric archival photo if blank)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or your image link"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heavy Industry, 1920s, Concrete Arch, Secret Vault"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#243142] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="p-4 bg-[#141b24] border border-[#232e3d] rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-[#22c55e]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold uppercase tracking-wide">
                    LOSTPLACES Archival Pledge
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  By submitting, you confirm that this documentation preserves architectural history. Submissions are saved to your permanent archive and searchable by fellow explorers.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Footer Controls */}
          <div className="pt-4 border-t border-[#232b35] flex items-center justify-between gap-3">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18212c] hover:bg-[#202b39] text-slate-300 rounded-lg text-xs cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-500 font-mono">Fill essentials & click Save</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s + 1) as any)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#18212c] hover:bg-[#222e3d] text-slate-200 text-xs rounded-lg border border-[#2b394b] transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Primary Instant Save & Publish Button */}
              <button
                type="button"
                onClick={executeSave}
                className="flex items-center gap-2 px-5 py-2 bg-[#22c55e] hover:bg-[#4ade80] text-[#0b0e11] font-bold rounded-lg text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save & Publish Discovery</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
