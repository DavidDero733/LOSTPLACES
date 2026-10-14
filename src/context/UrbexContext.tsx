import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UrbexLocation, 
  Collection, 
  UserProfile, 
  LocationReport, 
  CategoryType, 
  ConditionType, 
  TileLayerType,
  FieldComment,
  UserRole,
  SortOption
} from '../types';
import { INITIAL_LOCATIONS, INITIAL_COLLECTIONS, INITIAL_USER, CITY_HUBS } from '../data/mockSpots';
import { calculateDistanceKm } from '../utils/geo';

interface UrbexContextType {
  locations: UrbexLocation[];
  filteredLocations: UrbexLocation[];
  collections: Collection[];
  user: UserProfile;
  reports: LocationReport[];
  
  // Filters & Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: CategoryType | 'all';
  setSelectedCategory: (c: CategoryType | 'all') => void;
  selectedCondition: ConditionType | 'all';
  setSelectedCondition: (c: ConditionType | 'all') => void;
  selectedCity: string | null;
  setSelectedCity: (c: string | null) => void;
  showCommunityOnly: boolean;
  setShowCommunityOnly: (v: boolean) => void;
  showMySubmissionsOnly: boolean;
  setShowMySubmissionsOnly: (v: boolean) => void;
  minRating: number | null;
  setMinRating: (r: number | null) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  
  // View & Map State
  viewMode: 'map' | 'list';
  setViewMode: (v: 'map' | 'list') => void;
  activeTileLayer: TileLayerType;
  setActiveTileLayer: (layer: TileLayerType) => void;
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  mapZoom: number;
  setMapZoom: (zoom: number) => void;
  userCoords: { lat: number; lng: number } | null;
  locateUser: () => void;
  
  // Selection & Modals
  selectedLocation: UrbexLocation | null;
  selectLocation: (loc: UrbexLocation | null) => void;
  flyToLocation: (loc: UrbexLocation) => void;
  flyToCity: (hub: typeof CITY_HUBS[0]) => void;
  
  activeModal: 'none' | 'detail' | 'submit' | 'collections' | 'profile' | 'safety' | 'directions' | 'moderation' | 'cartography';
  setActiveModal: (m: 'none' | 'detail' | 'submit' | 'collections' | 'profile' | 'safety' | 'directions' | 'moderation' | 'cartography') => void;
  
  // Pin placement in submission mode
  pinDropMode: boolean;
  setPinDropMode: (val: boolean) => void;
  pendingPinCoords: { lat: number; lng: number } | null;
  setPendingPinCoords: (coords: { lat: number; lng: number } | null) => void;
  
  // Role & Modes (Creator / Member / Guest)
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Finding & Discovery Helpers
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
  maxDistanceKm: number | null;
  setMaxDistanceKm: (dist: number | null) => void;
  jumpToRandomSpot: () => void;
  resetAllFilters: () => void;

  // CRUD & Creator Management
  addLocation: (newLoc: Partial<UrbexLocation>) => UrbexLocation;
  deleteLocation: (locationId: string) => void;
  restoreDefaultSpots: () => void;
  clearAllSpots: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  toggleSaveLocation: (locationId: string) => void;
  isSaved: (locationId: string) => boolean;
  addComment: (locationId: string, text: string, conditionReport?: string) => void;
  reportLocation: (locationId: string, locationName: string, reason: LocationReport['reason'], details: string) => void;
  createCollection: (name: string, description: string) => void;
  toggleLocationInCollection: (collectionId: string, locationId: string) => void;
  resolveReport: (reportId: string) => void;
}

const UrbexContext = createContext<UrbexContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LOCATIONS: 'lostplaces_locations_v3',
  CUSTOM_SPOTS: 'lostplaces_community_spots_v3',
  COLLECTIONS: 'lostplaces_collections_v3',
  USER: 'lostplaces_user_v3',
  REPORTS: 'lostplaces_reports_v3',
  ROLE: 'lostplaces_role_v3',
};

// In-memory fallback dictionary if iframe blocks localStorage
const memoryStore: Record<string, string> = {};

// Resilient storage wrapper that works seamlessly across iframes, third-party sandboxes & Safari
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // fallback to memory
    }
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // safe fallback in memory
    }
  }
};

export const UrbexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Toast alert
  const [toastMessage, setToastMessageState] = useState<string | null>(null);

  const setToastMessage = (msg: string | null) => {
    setToastMessageState(msg);
    if (msg) {
      setTimeout(() => {
        setToastMessageState((curr) => (curr === msg ? null : curr));
      }, 4000);
    }
  };

  // Helper to load and merge locations so user submissions are NEVER lost
  const loadInitialLocations = (): UrbexLocation[] => {
    try {
      const savedLocationsRaw = safeStorage.getItem(STORAGE_KEYS.LOCATIONS);
      const savedCustomSpotsRaw = safeStorage.getItem(STORAGE_KEYS.CUSTOM_SPOTS);

      let loadedList: UrbexLocation[] = [];

      if (savedLocationsRaw) {
        loadedList = JSON.parse(savedLocationsRaw);
      }

      // If loadedList is empty or missing defaults, initialize with INITIAL_LOCATIONS
      if (!loadedList || loadedList.length === 0) {
        loadedList = [...INITIAL_LOCATIONS];
      }

      // Also ensure any custom spots in CUSTOM_SPOTS key are merged in case LOCATIONS was reset
      if (savedCustomSpotsRaw) {
        const customSpots: UrbexLocation[] = JSON.parse(savedCustomSpotsRaw);
        if (Array.isArray(customSpots)) {
          customSpots.forEach((customSpot) => {
            if (!loadedList.some((l) => l.id === customSpot.id)) {
              loadedList.unshift(customSpot);
            }
          });
        }
      }

      return loadedList;
    } catch (err) {
      console.warn('Failed parsing locations from storage, using defaults:', err);
      return INITIAL_LOCATIONS;
    }
  };

  // Locations state
  const [locations, setLocations] = useState<UrbexLocation[]>(loadInitialLocations);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  });

  // User state
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Reports state
  const [reports, setReports] = useState<LocationReport[]>(() => {
    try {
      const saved = safeStorage.getItem(STORAGE_KEYS.REPORTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Role & Modes: creator, member, guest (Default: 'creator' so the creator immediately has full tools!)
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (safeStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'creator';
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    safeStorage.setItem(STORAGE_KEYS.ROLE, role);
    if (role === 'creator') {
      setToastMessage('👑 CREATOR MODE ACTIVATED — Full delete tools, database export, and moderation powers unlocked.');
    } else if (role === 'guest') {
      setToastMessage('🕶️ GUEST MODE ACTIVATED — Browsing anonymously without any account or API keys.');
    } else {
      setToastMessage('👤 EXPLORER MEMBER MODE — Contributing and collecting as community member.');
    }
  };

  // State saving effects
  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    // Also save community spots in backup key
    const customOnly = locations.filter((l) => l.isCommunitySubmitted);
    safeStorage.setItem(STORAGE_KEYS.CUSTOM_SPOTS, JSON.stringify(customOnly));
  }, [locations]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    safeStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ConditionType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCommunityOnly, setShowCommunityOnly] = useState(false);
  const [showMySubmissionsOnly, setShowMySubmissionsOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Sorting & Easy finding
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(null);

  // Map & View
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeTileLayer, setActiveTileLayer] = useState<TileLayerType>('dark');
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.3789, -83.0289]); // Packard Plant Detroit default
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Modals & Active item
  const [selectedLocation, setSelectedLocation] = useState<UrbexLocation | null>(null);
  const [activeModal, setActiveModal] = useState<UrbexContextType['activeModal']>('none');
  const [pinDropMode, setPinDropMode] = useState(false);
  const [pendingPinCoords, setPendingPinCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Geolocation handler
  const locateUser = () => {
    if ('geolocation' in navigator) {
      setToastMessage('Acquiring GPS position...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setMapCenter([coords.lat, coords.lng]);
          setMapZoom(13);
          setSortOption('closest');
          setToastMessage('✓ GPS Located! Spots sorted by proximity to you.');
        },
        (err) => {
          console.warn('Geolocation unavailable:', err.message);
          setToastMessage('Could not acquire GPS position. Browsing standard map view.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setToastMessage('Geolocation is not supported by your browser.');
    }
  };

  const selectLocation = (loc: UrbexLocation | null) => {
    setSelectedLocation(loc);
    if (loc) {
      setActiveModal('detail');
    }
  };

  const flyToLocation = (loc: UrbexLocation) => {
    setSelectedLocation(loc);
    setMapCenter([loc.coordinates.lat, loc.coordinates.lng]);
    setMapZoom(14);
  };

  const flyToCity = (hub: typeof CITY_HUBS[0]) => {
    setSelectedCity(hub.name);
    setMapCenter([hub.lat, hub.lng]);
    setMapZoom(hub.zoom);
  };

  // Jump to random discovery
  const jumpToRandomSpot = () => {
    if (locations.length === 0) return;
    const randomIndex = Math.floor(Math.random() * locations.length);
    const spot = locations[randomIndex];
    setSelectedCity(null);
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSearchQuery('');
    flyToLocation(spot);
    selectLocation(spot);
    setToastMessage(`🎲 Surprise Exploration: ${spot.name} (${spot.city})`);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedCity(null);
    setShowCommunityOnly(false);
    setShowMySubmissionsOnly(false);
    setMaxDistanceKm(null);
    setMinRating(null);
    setSortOption('recent');
  };

  // Filter computation with distance calculation and sorting
  const filteredLocations = locations
    .filter((loc) => {
      if (showMySubmissionsOnly && !user.submittedSpotIds.includes(loc.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
        return false;
      }
      if (selectedCondition !== 'all' && loc.condition !== selectedCondition) {
        return false;
      }
      if (showCommunityOnly && !loc.isCommunitySubmitted) {
        return false;
      }
      if (minRating && loc.rating < minRating) {
        return false;
      }
      if (selectedCity && !loc.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }
      if (maxDistanceKm && (userCoords || mapCenter)) {
        const ref = userCoords || { lat: mapCenter[0], lng: mapCenter[1] };
        const dist = calculateDistanceKm(ref.lat, ref.lng, loc.coordinates.lat, loc.coordinates.lng);
        if (dist > maxDistanceKm) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = loc.name.toLowerCase().includes(q);
        const matchCity = loc.city.toLowerCase().includes(q);
        const matchRegion = loc.region.toLowerCase().includes(q);
        const matchCountry = loc.country.toLowerCase().includes(q);
        const matchTags = loc.tags.some(t => t.toLowerCase().includes(q));
        const matchCategory = loc.category.toLowerCase().includes(q);
        const matchHistory = loc.verifiedHistory.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchRegion && !matchCountry && !matchTags && !matchCategory && !matchHistory) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'closest') {
        const ref = userCoords || { lat: mapCenter[0], lng: mapCenter[1] };
        const distA = calculateDistanceKm(ref.lat, ref.lng, a.coordinates.lat, a.coordinates.lng);
        const distB = calculateDistanceKm(ref.lat, ref.lng, b.coordinates.lat, b.coordinates.lng);
        return distA - distB;
      }
      if (sortOption === 'rating') {
        return b.rating - a.rating;
      }
      if (sortOption === 'abandoned') {
        return (a.yearAbandoned || 9999) - (b.yearAbandoned || 9999);
      }
      // Default: 'recent'
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  // Robust Add & Save Location
  const addLocation = (newLoc: Partial<UrbexLocation>): UrbexLocation => {
    // Default fallback image if none provided
    const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80';

    const coordinates = newLoc.coordinates || { lat: mapCenter[0], lng: mapCenter[1] };

    const spot: UrbexLocation = {
      id: `spot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newLoc.name?.trim() || 'Unnamed Abandoned Site',
      category: newLoc.category || 'industrial',
      city: newLoc.city?.trim() || (selectedCity || 'Unknown City'),
      region: newLoc.region?.trim() || '',
      country: newLoc.country?.trim() || 'Global',
      coordinates: coordinates,
      precision: newLoc.precision || 'exact',
      yearBuilt: newLoc.yearBuilt,
      yearAbandoned: newLoc.yearAbandoned,
      condition: newLoc.condition || 'decayed',
      accessStatus: newLoc.accessStatus || 'strict_trespass_risk',
      hazards: newLoc.hazards || {
        structuralInstability: true,
        asbestosOrChemicals: false,
        activeSecurityPatrols: false,
        floodingOrWaterSubmersion: false,
        sharpMetalOrGlass: true,
        hiddenShaftsOrDropOffs: false,
        extremeDarkness: false,
        notes: 'Exercise vigilance. Structural stability has not been municipally inspected.',
      },
      publicViewpointDirections: newLoc.publicViewpointDirections?.trim() || 'Viewable from perimeter public roadway or sidewalk.',
      verifiedHistory: newLoc.verifiedHistory?.trim() || 'Documented field survey recorded by community explorer.',
      communityRumorsAndLore: newLoc.communityRumorsAndLore?.trim() || '',
      images: newLoc.images && newLoc.images.length > 0 && newLoc.images[0].trim()
        ? newLoc.images 
        : [fallbackImage],
      thumbnail: newLoc.thumbnail || (newLoc.images && newLoc.images[0]) || fallbackImage,
      rating: 5.0,
      contributionsCount: 1,
      isCommunitySubmitted: true,
      submittedBy: userRole === 'guest' ? 'Anonymous Guest' : user.username,
      dateAdded: new Date().toISOString().split('T')[0],
      lastConditionUpdate: new Date().toISOString().split('T')[0],
      tags: newLoc.tags && newLoc.tags.length > 0 ? newLoc.tags : ['Community Added', 'Recent Survey'],
      comments: [],
    };

    // 1. Immediately update state and save to storage
    setLocations((prev) => {
      const next = [spot, ...prev.filter(item => item.id !== spot.id)];
      safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(next));
      
      // Save community spots separately to guarantee they persist across resets
      const customOnly = next.filter(l => l.isCommunitySubmitted);
      safeStorage.setItem(STORAGE_KEYS.CUSTOM_SPOTS, JSON.stringify(customOnly));
      return next;
    });

    // 2. Add to user profile
    setUser((prev) => {
      const nextUser = {
        ...prev,
        reputation: prev.reputation + 150,
        submittedSpotIds: [spot.id, ...prev.submittedSpotIds.filter(id => id !== spot.id)],
        savedLocationIds: [spot.id, ...prev.savedLocationIds.filter(id => id !== spot.id)],
      };
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      return nextUser;
    });

    // 3. Clear active filters so new spot is immediately visible
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedCity(null);
    setSearchQuery('');
    setShowCommunityOnly(false);
    setShowMySubmissionsOnly(false);

    // 4. Center map and open detail modal
    setMapCenter([spot.coordinates.lat, spot.coordinates.lng]);
    setMapZoom(14);
    setSelectedLocation(spot);
    setActiveModal('detail');
    setToastMessage(`✓ Discovery saved! "${spot.name}" is now permanently recorded.`);

    return spot;
  };

  // Creator & Owner Delete Spot Tool
  const deleteLocation = (locationId: string) => {
    const locToDelete = locations.find(l => l.id === locationId);
    const locName = locToDelete ? `"${locToDelete.name}"` : 'Spot';

    // 1. Remove from locations list
    setLocations((prev) => {
      const updated = prev.filter((loc) => loc.id !== locationId);
      safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(updated));
      const customOnly = updated.filter(l => l.isCommunitySubmitted);
      safeStorage.setItem(STORAGE_KEYS.CUSTOM_SPOTS, JSON.stringify(customOnly));
      return updated;
    });

    // 2. Remove from user lists
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        savedLocationIds: prev.savedLocationIds.filter((id) => id !== locationId),
        submittedSpotIds: prev.submittedSpotIds.filter((id) => id !== locationId),
      };
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });

    // 3. Remove from collections
    setCollections((prev) => {
      const updatedCols = prev.map((col) => ({
        ...col,
        locationIds: col.locationIds.filter((id) => id !== locationId),
      }));
      safeStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(updatedCols));
      return updatedCols;
    });

    // 4. If current modal or selected spot is this one, close modal
    if (selectedLocation?.id === locationId) {
      setSelectedLocation(null);
      if (activeModal === 'detail') {
        setActiveModal('none');
      }
    }

    setToastMessage(`✓ ${locName} permanently deleted from archive.`);
  };

  // Restore Default Spots (Creator tool)
  const restoreDefaultSpots = () => {
    // Keep custom spots if desired or reset to initial
    const customOnly = locations.filter(l => l.isCommunitySubmitted);
    const combined = [...customOnly, ...INITIAL_LOCATIONS.filter(init => !customOnly.some(c => c.id === init.id))];
    
    setLocations(combined);
    safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(combined));
    setToastMessage('✓ Archival default spots restored while preserving your custom discoveries.');
  };

  // Clear all spots (Creator tool)
  const clearAllSpots = () => {
    setLocations([]);
    safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify([]));
    safeStorage.setItem(STORAGE_KEYS.CUSTOM_SPOTS, JSON.stringify([]));
    setSelectedLocation(null);
    setToastMessage('✓ All spots cleared from the database.');
  };

  // Export database to JSON file (Creator tool)
  const exportDatabaseJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(locations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `lostplaces_archive_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setToastMessage('✓ Database backup exported to JSON file.');
    } catch (e) {
      console.warn('Export failed:', e);
      setToastMessage('Export failed. Check browser permissions.');
    }
  };

  // Import database from JSON file (Creator tool)
  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].coordinates) {
        setLocations(parsed);
        safeStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(parsed));
        const customOnly = parsed.filter(l => l.isCommunitySubmitted);
        safeStorage.setItem(STORAGE_KEYS.CUSTOM_SPOTS, JSON.stringify(customOnly));
        setToastMessage(`✓ Successfully imported ${parsed.length} locations into LOSTPLACES!`);
        return true;
      }
      setToastMessage('Invalid JSON format. Expected an array of urbex locations.');
      return false;
    } catch {
      setToastMessage('Failed to parse JSON file.');
      return false;
    }
  };

  const toggleSaveLocation = (locationId: string) => {
    setUser((prev) => {
      const isAlreadySaved = prev.savedLocationIds.includes(locationId);
      const nextSaved = isAlreadySaved
        ? prev.savedLocationIds.filter((id) => id !== locationId)
        : [...prev.savedLocationIds, locationId];
      const nextUser = { ...prev, savedLocationIds: nextSaved };
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(nextUser));
      setToastMessage(isAlreadySaved ? "Spot removed from saved collection" : "✓ Spot saved to your personal collection!");
      return nextUser;
    });
  };

  const isSaved = (locationId: string) => {
    return user.savedLocationIds.includes(locationId);
  };

  const addComment = (locationId: string, text: string, conditionReport?: string) => {
    const comment: FieldComment = {
      id: `comm-${Date.now()}`,
      locationId,
      authorName: userRole === 'guest' ? 'Anonymous Guest' : user.username,
      authorReputation: userRole === 'guest' ? 0 : user.reputation,
      authorAvatar: userRole === 'guest' ? undefined : user.avatar,
      date: new Date().toISOString().split('T')[0],
      conditionStatusReport: conditionReport,
      text,
      isVerifiedExplorer: userRole !== 'guest',
    };

    setLocations((prev) =>
      prev.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            contributionsCount: loc.contributionsCount + 1,
            lastConditionUpdate: conditionReport ? new Date().toISOString().split('T')[0] : loc.lastConditionUpdate,
            comments: [comment, ...loc.comments],
          };
        }
        return loc;
      })
    );

    if (userRole !== 'guest') {
      setUser((prev) => ({
        ...prev,
        reputation: prev.reputation + 25,
      }));
    }
  };

  const reportLocation = (
    locationId: string,
    locationName: string,
    reason: LocationReport['reason'],
    details: string
  ) => {
    const report: LocationReport = {
      id: `rep-${Date.now()}`,
      locationId,
      locationName,
      reason,
      details,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    setReports((prev) => [report, ...prev]);
    setToastMessage('✓ Report filed for community audit.');
  };

  const createCollection = (name: string, description: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      locationIds: [],
      isPrivate: false,
      createdAt: new Date().toISOString().split('T')[0],
      coverImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?auto=format&fit=crop&w=600&q=80',
    };
    setCollections((prev) => [...prev, newCol]);
  };

  const toggleLocationInCollection = (collectionId: string, locationId: string) => {
    setCollections((prev) =>
      prev.map((col) => {
        if (col.id === collectionId) {
          const hasIt = col.locationIds.includes(locationId);
          return {
            ...col,
            locationIds: hasIt
              ? col.locationIds.filter((id) => id !== locationId)
              : [...col.locationIds, locationId],
          };
        }
        return col;
      })
    );
  };

  const resolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r))
    );
  };

  return (
    <UrbexContext.Provider
      value={{
        locations,
        filteredLocations,
        collections,
        user,
        reports,
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
        toastMessage,
        setToastMessage,
        viewMode,
        setViewMode,
        activeTileLayer,
        setActiveTileLayer,
        mapCenter,
        setMapCenter,
        mapZoom,
        setMapZoom,
        userCoords,
        locateUser,
        selectedLocation,
        selectLocation,
        flyToLocation,
        flyToCity,
        activeModal,
        setActiveModal,
        pinDropMode,
        setPinDropMode,
        pendingPinCoords,
        setPendingPinCoords,
        userRole,
        setUserRole,
        sortOption,
        setSortOption,
        maxDistanceKm,
        setMaxDistanceKm,
        jumpToRandomSpot,
        resetAllFilters,
        addLocation,
        deleteLocation,
        restoreDefaultSpots,
        clearAllSpots,
        exportDatabaseJson,
        importDatabaseJson,
        toggleSaveLocation,
        isSaved,
        addComment,
        reportLocation,
        createCollection,
        toggleLocationInCollection,
        resolveReport,
      }}
    >
      {children}
    </UrbexContext.Provider>
  );
};

export const useUrbex = () => {
  const context = useContext(UrbexContext);
  if (!context) {
    throw new Error('useUrbex must be used within an UrbexProvider');
  }
  return context;
};
