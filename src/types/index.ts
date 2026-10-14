export type CategoryType = 
  | 'industrial'
  | 'medical'
  | 'military'
  | 'subterranean'
  | 'residential'
  | 'religious'
  | 'leisure'
  | 'transit';

export type ConditionType = 
  | 'decayed'
  | 'ruins'
  | 'overgrown'
  | 'demolition_risk'
  | 'partially_preserved';

export type AccessStatusType =
  | 'public_viewpoint_only'
  | 'strict_trespass_risk'
  | 'unrestricted_perimeter'
  | 'guided_historical_tours'
  | 'extreme_structural_danger';

export type PrecisionType =
  | 'exact'
  | 'approximate'
  | 'members_only';

export interface FieldComment {
  id: string;
  locationId: string;
  authorName: string;
  authorReputation: number;
  authorAvatar?: string;
  date: string;
  conditionStatusReport?: string;
  text: string;
  isVerifiedExplorer?: boolean;
}

export interface HazardAudit {
  structuralInstability: boolean;
  asbestosOrChemicals: boolean;
  activeSecurityPatrols: boolean;
  floodingOrWaterSubmersion: boolean;
  sharpMetalOrGlass: boolean;
  hiddenShaftsOrDropOffs: boolean;
  extremeDarkness: boolean;
  notes: string;
}

export interface UrbexLocation {
  id: string;
  name: string;
  category: CategoryType;
  city: string;
  region: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  precision: PrecisionType;
  yearBuilt?: number;
  yearAbandoned?: number;
  condition: ConditionType;
  accessStatus: AccessStatusType;
  hazards: HazardAudit;
  publicViewpointDirections: string;
  verifiedHistory: string;
  communityRumorsAndLore: string;
  images: string[];
  historicalImages?: string[];
  thumbnail: string;
  rating: number;
  contributionsCount: number;
  isCommunitySubmitted: boolean;
  submittedBy?: string;
  dateAdded: string;
  lastConditionUpdate: string;
  tags: string[];
  comments: FieldComment[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  locationIds: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  reputation: number;
  badges: string[];
  memberSince: string;
  savedLocationIds: string[];
  submittedSpotIds: string[];
}

export interface LocationReport {
  id: string;
  locationId: string;
  locationName: string;
  reason: 'demolished' | 'incorrect_coords' | 'extreme_hazard' | 'private_security_risk' | 'vandalism';
  details: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export type TileLayerType = 'dark' | 'osm_standard' | 'satellite' | 'terrain';

export type UserRole = 'creator' | 'member' | 'guest';

export type SortOption = 'recent' | 'rating' | 'closest' | 'abandoned';
