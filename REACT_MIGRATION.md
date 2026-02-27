# React Migration Blueprint: Premium Maps Scraper & WhatsApp Blast

This document serves as the long-term architectural reference for migrating the current extension to a modern, scalable, and high-performance React-based stack.

## 🏗️ Technology Stack
- **Framework**: React 18 (Vite-powered for instant HMR)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS + CSS Modules (for localized glassmorphic components)
- **State Management**: Zustand (Atomic, performance-optimized store)
- **Animations**: Framer Motion (Premium micro-interactions)
- **Persistence**: `chrome.storage.local` with Zod validation
- **Build Tool**: Vite + CRXJS (Seamless extension manifest handling)

---

## 🛠️ Module Architecture & Roadmap

### Phase 1: Core Infrastructure & Manifest V3
- [x] Initialize Vite + TS + Tailwind project structure.
- [x] Setup `CRXJS` for manifest management.
- [x] Implement a **Background Service Worker** (migration of `background.js` and `wa_background.js`) using a Command-Pattern for message passing.
- [x] Centralize **Storage Manager** with cross-context synchronization.

### Phase 2: Design System & Shared Components (Atomic Design)
- [x] Create `GlassCard`, `Button`, `Input`, `Switch`, and `ProgressBar` base components.
- [x] Implement `Layout` wrapper (Sidebar/Header management).
- [x] Standardize the **Dark Aesthetics** tokens (HSL-based palette).

### Phase 3: Scraper Logic - Content Script & UI
- [x] **Content Engine**: Port `content.js` logic to a class-based `ScraperEngine`.
    - [x] Improved Scroll Algorithm (Back-off retry strategies).
    - [x] End-of-list detection hook.
- [x] **Scraper Popup**: 
    - [ ] Query Library management.
    - [x] Dynamic Location Builder (Country > State > City).
    - [x] Real-time progress monitoring via Zustand subscription.

### Phase 4: WhatsApp Blast - The Wizard
- [x] **Step 1: Data Integration**:
    - [x] Scraper Leads integration.
    - [x] CSV/JSON File Parser (Web Worker based).
- [x] **Step 2: Message Composer**:
    - [x] Rich Text Editor with variable injection.
    - [x] File Drop Zone (Custom logic for PDF/Media).
- [x] **Step 3: Advanced Settings**:
    - [x] Randomized delay logic.
    - [ ] Batch pausing settings.
- [x] **Step 4: Campaign Dashboard**:
    - [x] Stats Manager (Sent, Failed, History).
    - [x] Campaign Controller (Start, Pulse, Stop, Resume).

### Phase 5: Optimization & Cleanup
- [x] **Lazy Loading**: Basic setup.
- [x] **Memoization**: useMemo/useCallback strategy where needed.
- [x] **Data Compression**: Base64 pre-loading optimizations for the CV module.

---

## 📐 Senior Engineering Principles Applied
1. **Separation of Concerns**: Business logic (Scraping, WA Automation) isolated from UI components in specialized hooks (`useScraper`, `useWhatsApp`).
2. **Type Safety**: Full interfaces for Leads, Campaign Stats, and Storage Schemas.
3. **Error Handling**: Standardized `Result<T, Error>` patterns for background messaging.
4. **Efficiency**: Use of `RequestAnimationFrame` for UI updates during high-frequency scraping.
5. **Observability**: Centralized logging system to debug state transitions across contexts.

---

## 📂 Project Structure (Proposed)
```text
src/
├── assets/             # Icons, CV PDF, Static images
├── background/         # Service workers (Scraper & WA logic)
├── components/         # Shared UI (Atomic components)
│   ├── atoms/
│   ├── molecules/
│   └── templates/
├── content/            # Content scripts injected into Maps/WA
├── hooks/              # useScraper, useChromeStorage, useWhatsApp
├── pages/              # Main entry points
│   ├── popup/          # Scraper UI
│   └── whatsapp/       # Blast Wizard
├── services/           # API handlers, Sheet integration, CSV Parser
├── store/              # Zustand global state
├── types/              # TS Interfaces & Types
└── utils/              # Base64, Sleep, Formatting helpers
```
