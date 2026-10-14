# LOSTPLACES — Urban Exploration Discovery Archive

LOSTPLACES is an atmospheric, community-driven urban exploration (urbex) platform combining full-viewport interactive cartography, historical archiving, site condition reports, and community curation to discover and preserve forgotten architecture across the globe.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been aligned based on your preferences:

- **Confirmed Mapping Engine**: Leaflet with CartoDB Dark Matter as the default atmospheric basemap, with one-click toggles to ESRI World Imagery (High-Resolution Satellite) and OpenStreetMap topographic layers.
- **Confirmed Discovery Scope**: Curated global & local community discoveries spanning industrial ruins, abandoned medical facilities, subterranean transit, forgotten estates, and cold war installations, featuring both famous heritage sites and discreet community-submitted spots.
- **Confirmed Safety & Access Audits**: Exact coordinates displayed alongside prominent site hazard checklists (structural integrity, asbestos/mold warnings, security patrol levels, legal access status) and an explicit ethical urbex code of conduct.
- **Data Persistence Strategy**: Robust browser-backed persistence (`localStorage` with schema migration and export/import capability), pre-seeded with rich architectural photography, historical timelines, and community field notes, ready for seamless Supabase/PostgreSQL backend binding.

---

## 1. Overview & Core Concept

- **What It Does**: LOSTPLACES provides an underground digital field guide for urban explorers, architectural historians, and documentary photographers. Users can freely explore a high-contrast dark interactive map, inspect site hazard audits, view archival photography, read verified history versus explorer field logs, submit newly discovered locations with coordinate placement, and organize discoveries into curated collections.
- **Target Audience**: Urban explorers, heritage preservationists, photographers, architectural historians, and curious travelers seeking overlooked historical structures.
- **Key Value**: Replaces fragmented forum threads and hidden GPS waypoints with an organized, responsible, and aesthetically stunning directory that balances site discovery with safety, preservation ethics, and historical documentation.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Atmospheric Discovery (Landing & Map Explorer)**:
   - Opens to a cinematic full-viewport dark map displaying custom category markers (Industrial, Medical, Subterranean, Residential, Military, Transit).
   - Tagline marquee: *"THE CITY FORGOT. WE REMEMBER."* with quick city jumping (e.g., Detroit, Berlin, Paris Catacombs, Pripyat, Tokyo Subterranean, Gary, Pittsburgh).
   - Collapsible frosted-glass sidebar providing instant keyword search, distance slider, category filters, and toggle between interactive map view and editorial card list.
   - Interactive marker click smoothly pans the map and brings up a detailed preview card with photographs, distance, safety advisory, and verified badge.

2. **Deep Location Inspection (Detail View)**:
   - Cinematic gallery with photo viewer, expandable historical timeline, and side-by-side comparison of historical photos and modern decay.
   - **Hazard & Condition Audit**: High-contrast checklist covering structural stability, contaminants (asbestos/chemicals), security patrols, legal classification (demolition pending, protected landmark, private trespassing risks).
   - **Community Notes & Field Logs**: Recent explorer status updates (e.g. "Boarded up as of Sep 2026", "Roof collapse in north wing").
   - **Actions**: Save to collection ("Forgotten Factories", "Subterranean", etc.), request directions to safe public viewpoint, and flag/report inaccurate coordinates.

3. **Community Spot Submission**:
   - Multi-step intuitive modal:
     - Step 1: Location details (Name, Category, City/Region, Coordinates via map click or manual Lat/Lng).
     - Step 2: History & Description (Separating verified historical facts from unverified rumors).
     - Step 3: Access & Safety Audit (Public viewpoint vs interior risks, hazard checkboxes, gear recommendations).
     - Step 4: Photographic evidence and tags.
   - Real-time coordinate verification and duplicate check.

4. **Explorer Profile & Collections**:
   - Custom username, bio, explorer reputation score, and contribution badges.
   - Curated collections management (e.g. "Rust Belt Heavy Industry", "Hidden Tunnels & Subterranean", "Sanatoriums & Asylums").
   - Community moderation tab allowing users to review pending submissions, flag unsafe coordinates, and audit field updates.

### Visual Identity & Theme

- **Aesthetic Direction**: Underground archival / field survey apparatus. Moody, dark, restrained, and atmospheric.
- **Color Palette**:
  - Neutral Canvas (60%): Deep obsidian slate (`#0B0E11`), charcoal surfaces (`#13181E`), hairline borders (`#232B35`).
  - Structural Muted Accents (30%): Weathered concrete gray (`#8A94A6`), misty parchment (`#E2E8F0`), atmospheric dark glass (`rgba(19, 24, 30, 0.85)`).
  - High-Intent Accents (10%): Phosphor lichen green (`#22C55E` / `#4ADE80`) for active map pins and verified marks, amber rust (`#F59E0B`) for safety alerts and hazard warnings.
- **Typography & Hierarchy**:
  - Headings: Crisp architectural display sans (`Plus Jakarta Sans` / `Outfit`).
  - Body: Readable editorial prose with comfortable leading.
  - Coordinates & Telemetry: Monospace tabular numerals (`font-mono tabular-nums`) for latitude/longitude, elevation, and dates.
- **Zero-Pill Discipline**:
  - Metadata is presented in clean unboxed typography with typographic bullets (`·`), avoiding colorful capsule pills.
  - Interactive filter tabs use understated segmented control surfaces.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Alternatives Considered |
| :--- | :--- | :--- |
| **Mapping Engine** | Leaflet + CartoDB Dark Matter + ESRI Satellite | Guarantees instant 100% reliable load without proprietary token blockers, high-contrast atmospheric dark styling, and buttery tile rendering. |
| **Location Precision & Ethics** | Exact coordinates paired with mandatory Hazard Audit & Public Viewpoint note | Satisfies user preference for exact discovery while actively educating explorers on legal access, public perimeters, and physical hazards. |
| **State & Persistence** | Browser `localStorage` + Seeded Urbex Database + Export/Import | Eliminates dependency on external database provisioning while providing persistent additions, comments, bookmarks, and full offline survivability. |
| **Moderation Engine** | Integrated Community Flagging & Audit Panel | Lets users report incorrect coordinates, dangerous structural collapses, or sensitive demolition sites immediately. |

---

## 4. Technical Architecture & Data Strategy

### System & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App Container                             │
│       (Theme, Map Context, LocalStorage Store, Active Location State)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    │                                                              │
┌───▼───────────────────────────┐             ┌────────────────────▼───────────────────┐
│       Top Navigation Bar      │             │              Main Viewport             │
│  Brand: LOSTPLACES · Nav Links│             │  [Full-Screen Leaflet Map Engine]      │
│  [Explore / Archive / Submit] │             │  - CartoDB Dark / Satellite Layer      │
└───────────────────────────────┘             │  - Clustered Category Custom Markers   │
                                              │  - Geolocation & Viewpoint Routing     │
                                              └────────────────────┬───────────────────┘
                                                                   │
               ┌───────────────────────────────────────────────────┴───────────────────────────────┐
               │                                                   │                               │
┌──────────────▼─────────────────┐               ┌─────────────────▼───────────────┐   ┌───────────▼──────────────┐
│       Discovery Sidebar        │               │     Location Detail Modal       │   │   Submission Wizard      │
│ - Search & City Quick-Jumps    │               │ - Atmospheric Photo Gallery     │   │ - Map Pin Dropper / Lat-Lng│
│ - Category Segmented Filter    │               │ - Verified History vs Explorer  │   │ - Categorization & History│
│ - Distance & Condition Sliders │               │ - Hazard & Safety Audit List    │   │ - Hazard Audit Checkboxes│
│ - Spot Cards (Unboxed Meta)    │               │ - Field Notes & Comment Feed    │   │ - Photo Uploader         │
│ - Map / List View Switcher     │               │ - Bookmark to Collection Action │   │ - Immediate DB Sync      │
└───────────────────────────────┘               └─────────────────────────────────┘   └──────────────────────────┘
```

### Core Data Models

- **`UrbexLocation`**:
  - `id`: unique identifier
  - `name`: site title (e.g., *Packard Automotive Plant*, *Teufelsberg Listening Station*)
  - `category`: `'industrial' | 'medical' | 'military' | 'subterranean' | 'residential' | 'religious' | 'leisure'`
  - `coordinates`: `{ lat: number, lng: number }`
  - `city`: string
  - `country`: string
  - `yearAbandoned`: number
  - `condition`: `'decayed' | 'ruins' | 'overgrown' | 'demolition_risk' | 'partially_preserved'`
  - `accessStatus`: `'public_viewpoint_only' | 'strict_trespass_risk' | 'unrestricted_perimeter' | 'guided_tours_available'`
  - `hazards`: string[] (`['Asbestos', 'Unstable Flooring', 'Active Security', 'Flooding', 'Sharp Metal']`)
  - `publicViewpointDirections`: string
  - `verifiedHistory`: string
  - `communityNotes`: string
  - `images`: string[]
  - `rating`: number
  - `reviewsCount`: number
  - `isCommunitySubmitted`: boolean
  - `dateAdded`: string
- **`Collection`**: `id`, `name`, `description`, `icon`, `spotIds[]`
- **`FieldComment`**: `id`, `locationId`, `author`, `date`, `conditionReport`, `commentText`, `avatar`
- **`SubmissionReport`**: `id`, `locationId`, `reason`, `date`, `status`

### Component & State Mutation Mapping

- **City Search & Pan**: Entering or selecting a city instantly flies the map camera with a smooth transition, filtering the nearby spots list.
- **Marker Selection**: Clicking any pin updates `selectedLocationId`, opening the preview slide-out or full detail sheet without losing map context.
- **Submission Submission**: Validates coordinates, sanitizes input, injects the new spot into the store, updates `localStorage`, and flies the map directly to the newly dropped pin.
- **Collection Bookmarking**: Toggling save adds/removes location ID from selected collection with instant optimistic feedback.
- **Layer Switching**: Segmented control seamlessly toggles between CartoDB Dark Matter, ESRI Satellite World Imagery, and OpenStreetMap.

---

## 5. Verification & Testing Plan

1. **Map Rendering & Marker Accuracy**: Verify Leaflet initializes cleanly, custom SVG icons render sharply against dark tiles, and clustering behaves smoothly at all zoom levels.
2. **Layer Switching**: Ensure tile layers toggle between Dark Matter and Satellite without map stutter or flickering.
3. **Filtering & Discovery**: Test category filters (Industrial, Medical, Subterranean), condition selectors, and real-time query search.
4. **Spot Submission**: Submit a new discovery with custom coordinates and verify it appears immediately on the map and in the saved list.
5. **Safety Audits & Details**: Verify hazard tags, verified history, field comments, and collection saves operate with full state persistence.
6. **Responsive Layout**: Test desktop split layout (sidebar + full map) and mobile collapsible bottom navigation.
