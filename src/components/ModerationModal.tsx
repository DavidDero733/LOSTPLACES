import React, { useState } from 'react';
import { X, ShieldAlert, Flag, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { useUrbex } from '../context/UrbexContext';
import { LocationReport } from '../types';

export const ModerationModal: React.FC = () => {
  const { 
    activeModal, 
    setActiveModal, 
    reports, 
    resolveReport, 
    reportLocation, 
    selectedLocation,
    locations
  } = useUrbex();

  const [activeTab, setActiveTab] = useState<'report' | 'audit'>('audit');
  
  // New report form state
  const [selectedSpotId, setSelectedSpotId] = useState(selectedLocation?.id || locations[0]?.id || '');
  const [reason, setReason] = useState<LocationReport['reason']>('demolished');
  const [details, setDetails] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  if (activeModal !== 'moderation') return null;

  const targetSpot = locations.find(l => l.id === selectedSpotId);

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSpot || !details.trim()) return;

    reportLocation(targetSpot.id, targetSpot.name, reason, details.trim());
    setDetails('');
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setActiveTab('audit');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-[#0d1217] border border-[#232b35] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-[#232b35] flex items-center justify-between bg-[#121820]/90 select-none">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Community Moderation & Safety Audit Feed
            </h2>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className="p-1.5 rounded-lg bg-[#18212c] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-[#232b35] bg-[#0f151c] flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'border-[#22c55e] text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Queue ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'report'
                ? 'border-[#f59e0b] text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            File Inaccurate Data Report
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'audit' ? (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#22c55e] mb-2" />
                  <p>All recorded locations are currently verified and clear.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No active reports or coordinate inaccuracies pending review.
                  </p>
                </div>
              ) : (
                reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 bg-[#141b24] border border-[#232e3d] rounded-xl text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-slate-100">{rep.locationName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        rep.status === 'resolved' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800' 
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                      }`}>
                        {rep.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      REASON: <span className="text-slate-200 uppercase">{rep.reason.replace(/_/g, ' ')}</span>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans">
                      {rep.details}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1e2734]">
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(rep.timestamp).toLocaleString()}
                      </span>

                      {rep.status === 'pending' && (
                        <button
                          onClick={() => resolveReport(rep.id)}
                          className="px-2.5 py-1 text-[11px] bg-[#1e2a38] hover:bg-[#253547] text-[#4ade80] border border-[#2d4056] rounded transition-colors cursor-pointer"
                        >
                          Mark as Audited & Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSendReport} className="space-y-4 text-xs">
              {submittedMessage && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-lg text-xs">
                  Report submitted to LOSTPLACES community auditors. Thank you for keeping the map accurate!
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Location Under Review *
                </label>
                <select
                  value={selectedSpotId}
                  onChange={(e) => setSelectedSpotId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#232e3d] rounded-lg text-slate-100 focus:outline-none focus:border-[#22c55e]"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.city}, {loc.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reason for Report *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#232e3d] rounded-lg text-slate-100 focus:outline-none focus:border-[#22c55e]"
                >
                  <option value="demolished">Site has been demolished or razed</option>
                  <option value="incorrect_coords">Inaccurate GPS coordinates or pin placement</option>
                  <option value="extreme_hazard">Extreme new hazard (catastrophic roof collapse, toxic spill)</option>
                  <option value="private_security_risk">Active hostile security / armed guards</option>
                  <option value="vandalism">Sensitive historical site being targeted by vandalism</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Specific Details & Field Evidence *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context, date of visit, or municipal link confirming status change..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141b24] border border-[#232e3d] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#22c55e]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!details.trim()}
                  className="px-4 py-2 bg-[#f59e0b] hover:bg-amber-400 disabled:opacity-40 text-black font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Audit Report</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
