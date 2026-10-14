import React from 'react';
import { X, Globe, ShieldCheck, Check, Layers, Cpu, ExternalLink } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const CartographyModal: React.FC = () => {
  const { activeModal, setActiveModal, activeTileLayer, setActiveTileLayer } = useUrbex();

  if (activeModal !== 'cartography') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#16202a] border border-[#2e3b4a] flex items-center justify-center text-[#22c55e]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Keyless Open Cartography
              </h2>
              <span className="text-[10px] font-mono text-[#22c55e] uppercase">
                100% Free · Zero API Key Required
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

        {/* Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto">
          <div className="p-3.5 bg-[#141b24] border border-[#232f3f] rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#22c55e] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-100 text-xs block">
                No Personal API Keys or Accounts Required
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                LOSTPLACES is designed for friction-free exploration. It runs on public, open cartographic layers. You never have to configure Mapbox tokens, Google Cloud billing accounts, or credit cards.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider block">
              Integrated Open Map Layers:
            </span>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'dark',
                  name: 'CartoDB Dark Matter',
                  desc: 'High-contrast nocturnal vector styling optimized for atmospheric urbex mapping.',
                },
                {
                  id: 'osm_standard',
                  name: 'OpenStreetMap Streets',
                  desc: 'The gold standard of community-mapped global streets, trails, and public paths.',
                },
                {
                  id: 'satellite',
                  name: 'ESRI World Imagery',
                  desc: 'High-resolution global aerial satellite photography to inspect roof decay and perimeter fences.',
                },
                {
                  id: 'terrain',
                  name: 'CyclOSM Relief',
                  desc: 'Topographic contour elevation and terrain shading for rural and mountain ruins.',
                },
              ].map((layer) => {
                const isActive = activeTileLayer === layer.id;
                return (
                  <button
                    key={layer.id}
                    onClick={() => setActiveTileLayer(layer.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                      isActive 
                        ? 'bg-[#18232f] border-[#22c55e] shadow-md' 
                        : 'bg-[#11171f] border-[#212b37] hover:border-[#2f3d4e]'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-xs">{layer.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-mono bg-[#22c55e]/20 text-[#4ade80] px-1.5 py-0.2 rounded font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{layer.desc}</p>
                    </div>
                    {isActive ? (
                      <Check className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-[#1e2632] text-[11px] text-slate-500 font-mono">
            Cartographic data &copy; OpenStreetMap contributors &middot; CARTO &middot; Esri
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#232b35] bg-[#121820]/90 flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-2 bg-[#22c55e] hover:bg-[#4ade80] text-[#0b0e11] font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </div>
  );
};
