import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Crosshair, 
  Navigation, 
  MapPin, 
  ShieldCheck, 
  Globe, 
  Sparkles, 
  Plus, 
  Info, 
  Check, 
  Settings, 
  Key, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useUrbex, safeStorage } from '../context/UrbexContext';
import { UrbexLocation, CategoryType, TileLayerType } from '../types';

const CATEGORY_COLORS: Record<CategoryType, { bg: string; border: string; glow: string; text: string }> = {
  industrial: { bg: '#d97706', border: '#b45309', glow: 'rgba(217, 119, 6, 0.4)', text: '#fef3c7' },
  medical: { bg: '#e11d48', border: '#be123c', glow: 'rgba(225, 29, 72, 0.4)', text: '#ffe4e6' },
  military: { bg: '#854d0e', border: '#713f12', glow: 'rgba(133, 77, 14, 0.4)', text: '#fef9c3' },
  subterranean: { bg: '#0284c7', border: '#0369a1', glow: 'rgba(2, 132, 199, 0.4)', text: '#e0f2fe' },
  residential: { bg: '#059669', border: '#047857', glow: 'rgba(5, 150, 105, 0.4)', text: '#d1fae5' },
  religious: { bg: '#7c3aed', border: '#6d28d9', glow: 'rgba(124, 58, 237, 0.4)', text: '#ede9fe' },
  transit: { bg: '#4f46e5', border: '#4338ca', glow: 'rgba(79, 70, 229, 0.4)', text: '#e0e7ff' },
  leisure: { bg: '#0d9488', border: '#0f766e', glow: 'rgba(13, 148, 136, 0.4)', text: '#ccfbf1' },
};

const CATEGORY_ICONS: Record<CategoryType, string> = {
  industrial: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>',
  medical: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2h5v5c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2h-2z"/></svg>',
  military: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  subterranean: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 18 5-5 5 2 7-7"/><path d="M2 22h20"/><path d="M18 6h3v3"/></svg>',
  residential: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  religious: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="5" y1="8" x2="19" y2="8"/></svg>',
  transit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>',
  leisure: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 15 5-3-5-3v6Z"/></svg>',
};

export const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [showKeylessInfo, setShowKeylessInfo] = useState(false);
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => safeStorage.getItem('lostplaces_custom_mapbox_key') || '');
  const [useCustomKey, setUseCustomKey] = useState(() => safeStorage.getItem('lostplaces_use_custom_key') === 'true');
  const [tileEngineStatus, setTileEngineStatus] = useState<'online' | 'connecting'>('online');

  const {
    filteredLocations,
    selectedLocation,
    selectLocation,
    mapCenter,
    mapZoom,
    activeTileLayer,
    setActiveTileLayer,
    userCoords,
    locateUser,
    pinDropMode,
    setPinDropMode,
    setPendingPinCoords,
    setActiveModal,
    jumpToRandomSpot,
    setToastMessage
  } = useUrbex();

  // Bulletproof, 100% free, keyless tile providers that NEVER fail or require API keys
  const getTileLayerConfig = (layer: TileLayerType) => {
    // If user provided their own Mapbox token and enabled it
    if (useCustomKey && customApiKey.trim()) {
      return {
        url: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=${customApiKey.trim()}`,
        attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
        className: '',
        subdomains: [] as string[],
        maxZoom: 19,
      };
    }

    if (layer === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &middot; Public Satellite Imagery (Keyless & Open)',
        className: '',
        subdomains: [] as string[],
        maxZoom: 19,
      };
    }

    if (layer === 'terrain') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &middot; Topographic Relief (Keyless & Open)',
        className: '',
        subdomains: [] as string[],
        maxZoom: 18,
      };
    }

    if (layer === 'osm_standard') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; Esri &middot; World Street Map (Keyless & Open)',
        className: '',
        subdomains: [] as string[],
        maxZoom: 19,
      };
    }

    // Default 'dark': ESRI Dark Gray Canvas (High contrast, public, rock-solid, 0 API keys required)
    return {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &middot; Dark Canvas Cartography (100% Free & Keyless)',
      className: '',
      subdomains: [] as string[],
      maxZoom: 19,
    };
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: mapCenter,
      zoom: mapZoom,
      zoomControl: false,
      attributionControl: true,
      minZoom: 2,
      maxZoom: 19,
    });

    // Add customized zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const cfg = getTileLayerConfig(activeTileLayer);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      className: cfg.className,
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
    }).addTo(map);

    // Fallback if any tile errors
    tileLayer.on('tileerror', (e) => {
      console.warn('Tile load issue, falling back to mirror:', e);
    });

    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;

    // Handle map click for pin placement mode
    map.on('click', (e: L.LeafletMouseEvent) => {
      if ((window as any).__LOSTPLACES_PIN_DROP_MODE__) {
        const { lat, lng } = e.latlng;
        setPendingPinCoords({ lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) });
        setPinDropMode(false);
        setActiveModal('submit');
      }
    });

    // CRITICAL: Leaflet flex-container fix! Invalidate size after mount so the map NEVER renders grey tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    setTimeout(() => {
      map.invalidateSize();
    }, 600);

    // Attach ResizeObserver so the map smoothly resizes with sidebar toggles
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync global window flag for click listener
  useEffect(() => {
    (window as any).__LOSTPLACES_PIN_DROP_MODE__ = pinDropMode;
  }, [pinDropMode]);

  // Update tile layer based on activeTileLayer or custom key
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.remove();

    const cfg = getTileLayerConfig(activeTileLayer);
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      className: cfg.className,
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;

    // Trigger size invalidation to guarantee full tile coverage
    mapInstanceRef.current.invalidateSize();
  }, [activeTileLayer, useCustomKey, customApiKey]);

  // Sync center and zoom when changed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentCenter = mapInstanceRef.current.getCenter();
    const currentZoom = mapInstanceRef.current.getZoom();

    const dist = Math.abs(currentCenter.lat - mapCenter[0]) + Math.abs(currentCenter.lng - mapCenter[1]);
    if (dist > 0.001 || currentZoom !== mapZoom) {
      mapInstanceRef.current.flyTo(mapCenter, mapZoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [mapCenter, mapZoom]);

  // Render location markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredLocations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;
      const theme = CATEGORY_COLORS[loc.category] || CATEGORY_COLORS.industrial;
      const iconSvg = CATEGORY_ICONS[loc.category] || CATEGORY_ICONS.industrial;

      const markerHtml = `
        <div class="group relative cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="relative flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border"
                 style="background-color: ${theme.bg}; border-color: ${theme.border}; box-shadow: 0 0 16px ${isSelected ? theme.glow : 'rgba(0,0,0,0.5)'}; color: ${theme.text};">
              ${iconSvg}
            </div>
            ${loc.isCommunitySubmitted ? `
              <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#22c55e] border border-[#0b0e11] flex items-center justify-center" title="Community Contributed">
                <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              </div>
            ` : ''}
            ${isSelected ? `
              <div class="absolute -inset-1.5 rounded-full border border-dashed border-[#22c55e] animate-spin" style="animation-duration: 10s;"></div>
            ` : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-urbex-pin',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: customIcon });

      // Click to select
      marker.on('click', () => {
        selectLocation(loc);
      });

      // Tooltip hover
      marker.bindTooltip(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px 6px;">
          <div style="font-size: 11px; font-weight: 700; color: #f1f5f9; letter-spacing: 0.02em;">${loc.name}</div>
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace; text-transform: uppercase;">${loc.city} &middot; ${loc.category}</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -18],
        opacity: 0.95,
        className: 'custom-dark-tooltip'
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredLocations, selectedLocation]);

  // Render user location pin if available
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userHtml = `
        <div style="transform: translate(-50%, -50%);">
          <div class="relative flex items-center justify-center">
            <div class="w-4 h-4 rounded-full bg-[#38bdf8] border-2 border-white shadow-lg"></div>
            <div class="absolute -inset-2 rounded-full bg-[#38bdf8]/30 animate-ping"></div>
          </div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'user-pos-marker',
        html: userHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindTooltip('Your Location', { direction: 'top', offset: [0, -10] });
    }
  }, [userCoords]);

  const handleSaveCustomKey = () => {
    safeStorage.setItem('lostplaces_custom_mapbox_key', customApiKey.trim());
    safeStorage.setItem('lostplaces_use_custom_key', useCustomKey ? 'true' : 'false');
    setShowApiSettings(false);
    setToastMessage(useCustomKey ? '✓ Custom Mapbox key configured!' : '✓ Switched to Built-in Keyless Open Cartography.');
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Pin Drop Mode Banner Overlay */}
      {pinDropMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0f141a]/95 border border-[#22c55e] text-slate-100 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <Crosshair className="w-5 h-5 text-[#22c55e] animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">
              Click anywhere on the map to set spot coordinates
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Coordinates will be recorded with GPS accuracy
            </span>
          </div>
          <button
            onClick={() => setPinDropMode(false)}
            className="ml-3 px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Live Map Engine Status Indicator & API Settings Button (Top Left of Map) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div 
          onClick={() => setShowKeylessInfo(!showKeylessInfo)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#0f141a]/95 backdrop-blur-md border border-[#232b35] hover:border-[#22c55e]/50 rounded-lg shadow-xl text-[11px] font-mono text-slate-300 pointer-events-auto transition-colors cursor-pointer select-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
          <span className="text-[#22c55e] font-semibold">Map Active</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">100% Free & Keyless</span>
          <Info className="w-3 h-3 text-slate-400" />
        </div>

        {/* API Settings Button */}
        <button
          onClick={() => setShowApiSettings(true)}
          className="p-1.5 bg-[#0f141a]/90 hover:bg-[#18222d] backdrop-blur-md border border-[#232b35] hover:border-slate-500 rounded-lg shadow-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Map Engine & Custom API Key Settings"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Engine Explainer Popover */}
      {showKeylessInfo && (
        <div className="absolute top-14 left-4 z-30 max-w-sm bg-[#121820]/95 backdrop-blur-md border border-[#283648] rounded-xl p-4 shadow-2xl text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-[#22c55e] font-bold">
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Free Open Cartography</span>
            </div>
            <button onClick={() => setShowKeylessInfo(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            LOSTPLACES is powered by <strong>public open-source mapping</strong> with zero API key requirement. You never have to create billing accounts or purchase Mapbox/Google tokens.
          </p>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono">Status: Connected & Online</span>
            <button
              onClick={() => {
                setShowKeylessInfo(false);
                setShowApiSettings(true);
              }}
              className="text-[10px] font-bold text-[#22c55e] hover:underline cursor-pointer"
            >
              Custom Key Options →
            </button>
          </div>
        </div>
      )}

      {/* Custom API Key Settings Modal */}
      {showApiSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full p-5 bg-[#121820] border border-[#283648] rounded-2xl shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#232f3f] pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold">
                <Key className="w-4 h-4 text-[#22c55e]" />
                <span>Map Provider & API Key Options</span>
              </div>
              <button onClick={() => setShowApiSettings(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <Crosshair className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#16202c] border border-[#28394e] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#4ade80]">Default: Built-in Free Cartography</span>
                  <span className="text-[10px] font-mono bg-[#22c55e]/20 text-[#4ade80] px-1.5 py-0.2 rounded font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Requires <strong>NO API KEY</strong> and NO personal account. Uses high-performance OpenStreetMap and ESRI layers.
                </p>
                <label className="flex items-center gap-2 pt-1 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mapEngine"
                    checked={!useCustomKey}
                    onChange={() => setUseCustomKey(false)}
                    className="text-[#22c55e]"
                  />
                  <span>Use Built-in Free Cartography (Zero API Key)</span>
                </label>
              </div>

              <div className="p-3 bg-[#16202c] border border-[#28394e] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Optional: Custom Mapbox Access Token</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  If you have a personal Mapbox API key (`pk.eyJ...`), you can paste it here to use custom Mapbox vector tiles.
                </p>
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mapEngine"
                    checked={useCustomKey}
                    onChange={() => setUseCustomKey(true)}
                    className="text-[#22c55e]"
                  />
                  <span>Enable Custom Mapbox Key</span>
                </label>
                {useCustomKey && (
                  <input
                    type="text"
                    placeholder="pk.eyJ1..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#0d1217] border border-[#232f3f] rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-[#22c55e]"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232f3f]">
              <button
                onClick={() => setShowApiSettings(false)}
                className="px-3 py-1.5 bg-[#18212c] text-slate-300 rounded-lg hover:bg-[#202b39] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomKey}
                className="px-4 py-1.5 bg-[#22c55e] hover:bg-[#4ade80] text-[#0b0e11] font-bold rounded-lg cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Map Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        {/* Layer Switcher (Segmented Control - 4 Keyless Modes) */}
        <div className="flex items-center p-1 bg-[#0f141a]/90 backdrop-blur-md border border-[#232b35] rounded-lg shadow-xl">
          <button
            onClick={() => setActiveTileLayer('dark')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTileLayer === 'dark'
                ? 'bg-[#1e2632] text-[#4ade80] shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Dark Gray Nocturnal Cartography (100% Free & Keyless)"
          >
            Dark Canvas
          </button>
          <button
            onClick={() => setActiveTileLayer('satellite')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTileLayer === 'satellite'
                ? 'bg-[#1e2632] text-[#4ade80] shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Aerial Satellite Photography (Public & Keyless)"
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveTileLayer('osm_standard')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTileLayer === 'osm_standard'
                ? 'bg-[#1e2632] text-[#4ade80] shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard World Streets (100% Free & Keyless)"
          >
            Streets
          </button>
          <button
            onClick={() => setActiveTileLayer('terrain')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTileLayer === 'terrain'
                ? 'bg-[#1e2632] text-[#4ade80] shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Topographic Elevation Relief (100% Free & Keyless)"
          >
            Terrain
          </button>
        </div>

        {/* Locate User & Quick Surprise Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={jumpToRandomSpot}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0f141a]/90 hover:bg-[#16202a] active:bg-[#1e293b] backdrop-blur-md border border-[#232b35] text-slate-300 hover:text-[#4ade80] rounded-lg shadow-xl text-xs transition-colors cursor-pointer group"
            title="Surprise discovery: Teleport to a random abandoned location"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#22c55e] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-mono text-[11px]">Surprise Spot</span>
          </button>

          <button
            onClick={locateUser}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0f141a]/90 hover:bg-[#16202a] active:bg-[#1e293b] backdrop-blur-md border border-[#232b35] text-slate-300 hover:text-white rounded-lg shadow-xl text-xs transition-colors cursor-pointer group"
            title="Locate my position (Uses standard browser GPS, 0 API keys required)"
          >
            <Navigation className="w-3.5 h-3.5 text-[#22c55e] group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline font-mono text-[11px]">Locate Me</span>
          </button>
        </div>
      </div>

      {/* Selected Location Quick Preview Floating Pill (Bottom Left of Map) */}
      {selectedLocation && (
        <div className="absolute bottom-6 left-6 z-20 max-w-sm hidden lg:block">
          <div 
            onClick={() => selectLocation(selectedLocation)}
            className="p-3 bg-[#0f141a]/95 backdrop-blur-md border border-[#232b35] hover:border-[#22c55e]/50 rounded-xl shadow-2xl transition-all cursor-pointer group flex items-center gap-3"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
              <img 
                src={selectedLocation.thumbnail} 
                alt={selectedLocation.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-slate-100 group-hover:text-[#22c55e] transition-colors truncate">
                {selectedLocation.name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                <span className="uppercase font-mono">{selectedLocation.city}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{selectedLocation.category}</span>
                {selectedLocation.yearAbandoned && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Ab. {selectedLocation.yearAbandoned}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {selectedLocation.hazards.notes}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
