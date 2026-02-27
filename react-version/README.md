# Premium Maps Scraper & WhatsApp Blast (React Edition)

A professional-grade Chrome Extension suite built for high-performance lead generation and automated WhatsApp outreach.

## 🚀 Key Features

### 📍 Intelligent Maps Scraper
- **Automated Extraction**: Scrapes business details (Name, Phone, Rating, Category, Website) directly from Google Maps.
- **Smart Scrolling**: Implements back-off retry logic and "end of list" detection for reliable data collection.
- **Query Library**: Save your frequent search patterns (e.g., "Dental Clinics in London") for instant reuse.
- **Persistence**: Results and queries are automatically saved to `chrome.storage.local`.
- **Export Power**: Export your leads to a perfectly formatted CSV with one click.

### 💬 Advanced WhatsApp Blast
- **4-Step Campaign Wizard**: 
    1. **Data Integration**: Import leads from the scraper or upload custom CSV files.
    2. **Message Composer**: Interactive template builder with variable injection (`{{name}}`, `{{category}}`).
    3. **Anti-Ban Settings**: Advanced randomized delays and batch-based pausing (mimics human behavior).
    4. **Live Dashboard**: Real-time tracking of sent messages, skipped chats, and invalid numbers.
- **Background Orchestration**: Campaigns run in the service worker, allowing you to close the extension popup while the "Blast" continues.
- **Attachment Support**: Automated CV/PDF attachment with multiple fallback strategies (Direct + Drag & Drop).

## 🛠️ Technology Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion (Animations).
- **Core**: TypeScript (Strict Mode).
- **State**: Zustand + Chrome Storage Persistence.
- **Build**: Vite + CRXJS (Manifest V3).

## 📂 Architecture Overview
- `src/services/whatsapp.ts`: Core messaging engine with UI interaction strategies.
- `src/services/scraper.ts`: DOM-based scraping heuristics.
- `src/background/index.ts`: Central campaign orchestrator and tab manager.
- `src/store/`: Unified state management with custom Chrome Storage adapter.
- `src/content/`: Context-specific scripts for Maps and WhatsApp Web.

## 👨‍💻 Engineering Principles
- **Separation of Concerns**: Logic isolated from UI using service classes and custom hooks.
- **Reliability**: Health-check "Ping/Pong" system ensures content scripts are ready before action.
- **UX/UI**: Premium glassmorphic interface with micro-interactions and low-latency updates.

## 📦 Build Instructions
```bash
npm install
npm run build
```
Load the `dist` folder into Chrome via `chrome://extensions` (Developer Mode).

---
*Built with senior engineer best practices for scalability and performance.*
