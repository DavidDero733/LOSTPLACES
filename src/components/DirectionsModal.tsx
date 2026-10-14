import React from 'react';
import { X, Navigation, ExternalLink, MapPin, Compass } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const DirectionsModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedLocation, userCoords } = useUrbex();

  if (activeModal !== 'directions' || !selectedLocation) return null;

  const spot = selectedLocation;
  const { lat, lng } = spot.coordinates;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userCoords ? `${userCoords.lat}%2C${userCoords.lng}%3B` : ''}${lat}%2C${lng}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div className="flex items-center gap-2 text-[#38bdf8]">
            <Navigation className="w-4 h-4" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Directions to Public Viewpoint
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg bg-[#18212c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Target Location</span>
            <h3 className="text-sm font-bold text-slate-100 mt-0.5">{spot.name}</h3>
            <p className="font-mono text-slate-400 text-[11px] mt-0.5">
              Coordinates: {lat.toFixed(5)}, {lng.toFixed(5)} ({spot.city}, {spot.country})
            </p>
          </div>

          <div className="p-4 bg-[#141b24] border border-[#232f3f] rounded-xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] font-bold">
              Designated Safe Public Viewpoint Notes
            </span>
            <p className="text-slate-200 leading-relaxed font-sans">
              {spot.publicViewpointDirections}
            </p>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            Choose an external navigation client to calculate live street routing, turn-by-turn guidance, or public transit connections to the site perimeter:
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#18212c] hover:bg-[#202c3b] border border-[#2b394b] rounded-xl flex items-center justify-between text-slate-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-xs">Google Maps</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={osmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#18212c] hover:bg-[#202c3b] border border-[#2b394b] rounded-xl flex items-center justify-between text-slate-200 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#22c55e]" />
                <span className="font-semibold text-xs">OpenStreetMap</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-[#232b35] bg-[#0f141a] flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-1.5 bg-[#18212c] hover:bg-[#202b39] text-slate-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
