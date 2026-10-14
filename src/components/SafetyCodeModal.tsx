import React from 'react';
import { X, ShieldAlert, Check, AlertOctagon, Footprints, Camera, Lock, HeartHandshake } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';

export const SafetyCodeModal: React.FC = () => {
  const { activeModal, setActiveModal } = useUrbex();

  if (activeModal !== 'safety') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              The Urban Explorer Code of Conduct & Safety Protocol
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed font-sans">
          <p className="text-slate-200">
            Urban exploration is the non-destructive discovery and historical documentation of man-made structures that are abandoned, neglected, or hidden. Every LOSTPLACES contributor pledges adherence to five core ethical tenets:
          </p>

          <div className="space-y-3">
            <div className="p-3.5 bg-[#141b24] border border-[#232f3f] rounded-xl flex items-start gap-3">
              <Camera className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100">1. Take Only Photographs, Leave Only Footprints</h4>
                <p className="text-slate-400 mt-0.5">
                  Never steal relics, vandalize surfaces, smash glass, or spray paint graffiti. A site should remain exactly as discovered for future historians.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#141b24] border border-[#232f3f] rounded-xl flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100">2. No Forced Entry</h4>
                <p className="text-slate-400 mt-0.5">
                  Do not cut fences, pick padlocks, or break windows. If a site is sealed tight, respect the perimeter and utilize the documented public viewpoint.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#141b24] border border-[#232f3f] rounded-xl flex items-start gap-3">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100">3. Prioritize Physical Safety & Proper Gear</h4>
                <p className="text-slate-400 mt-0.5">
                  Always carry a high-lumen torch, spare batteries, an N95 or P100 respirator for asbestos/mold, puncture-resistant boots, and a charged phone. Never explore subterranean tunnels alone.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#141b24] border border-[#232f3f] rounded-xl flex items-start gap-3">
              <HeartHandshake className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100">4. Respect Memorial & Sensitive Grounds</h4>
                <p className="text-slate-400 mt-0.5">
                  Sites involving human tragedy, active structural demolition, or natural disasters require solemn historical reverence, not thrill-seeking vanity stunts.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-amber-300/90 text-[11px] font-mono">
            LEGAL DISCLAIMER: LOSTPLACES operates as a public historical and photographic database. All exploration is done at your own personal risk and discretion. Obey local laws and property signage.
          </div>
        </div>

        <div className="p-4 px-6 border-t border-[#232b35] bg-[#0f141a] flex justify-end">
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#4ade80] text-[#0b0e11] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            I Understand and Agree
          </button>
        </div>
      </div>
    </div>
  );
};
