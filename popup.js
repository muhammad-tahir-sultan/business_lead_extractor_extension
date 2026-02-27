/**
 * popup.js — DEPRECATED
 *
 * This file has been refactored into separate, single-responsibility modules.
 * See the js/ directory for the active code:
 *
 *   js/data.js          — Static suggestion & niche data arrays
 *   js/storage.js       — chrome.storage promise wrapper
 *   js/state.js         — Shared app state (scraped leads)
 *   js/sheets-api.js    — Google Apps Script fetch layer
 *   js/ui.js            — DOM helpers & updateFromState
 *   js/scraper.js       — Start / stop / cancel controls
 *   js/export.js        — CSV, Excel, Google Sheets export
 *   js/library.js       — Niche library panel & keyword autocomplete
 *   js/location.js      — Location builder panel
 *   js/sheet-viewer.js  — View Sheet Data modal
 *   js/sheet-append.js  — Append-to-sheet modal
 *   js/main.js          — Bootstrap (DOMContentLoaded + button wiring)
 *
 * popup.html loads the js/ modules directly — this file is no longer referenced.
 */
