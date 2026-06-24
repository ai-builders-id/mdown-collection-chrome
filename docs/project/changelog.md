# Changelog

> Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
> This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v2.1.0 (Upcoming)

_Not yet released._

Planned enhancements and improvements to be determined.

---

## v2.0.0 (Current) — 2026-06-03

**Rebrand to Blinker, dual-repo support, reorder tabs, and similarity search.**

This release marks a major shift: the extension is renamed from **mdown-dropper** to **blinker**, gains support for a second GitHub repository, introduces a similarity-aware search with aliases, and overhauls the entire codebase for extensibility.

### Added

- **Dual-repo architecture** — The extension now fetches file lists from two GitHub repositories simultaneously:
  - `ai-builders-id/prd-prompt-collection` (PRD Prompt tab)
  - `ai-builders-id/mdown-collection` (Prompt Collection tab)
  - Each repo has its own label, icon, color, and file filter rules.
- **Tab navigation** — Users can switch between PRD Prompt and Prompt Collection via tab buttons at the top of the popup.
- **Similarity search with aliases** — Search now expands shorthand keywords to their full forms (e.g., `cs` expands to `customer support`, `prd` expands to `product requirements`, `qa` expands to `quality assurance`, `api` expands to `application programming interface`), improving discoverability.
- **SVG icon** — Replaced raster PNG icons with a single animated SVG icon (`icons/blinker.svg`) featuring a pulsing blue dot and radar-like crosshairs on a dark background.
- **Content prefetch cache** — Drag-and-drop operations are now faster thanks to a `Map`-based prefetch cache that loads raw file contents ahead of time.
- **Size-based file listing** — Files now display their human-readable size next to the name instead of the hardcoded descriptions used in v1.

### Changed

- **Renamed from mdown-dropper to blinker** — All references updated in `manifest.json`, `popup.html`, `popup.js`, `content.js`, and `README.md`.
- **Default icon** — Changed from a multi-resolution PNG set to a single SVG (`icons/blinker.svg`) via `default_icon` in the manifest.
- **Tab order** — The PRD Prompt tab is now the default active tab, appearing before the Prompt Collection tab.
- **Popup dimensions** — Width increased from 340px to 400px; height fixed to 600px with `overflow:hidden`.
- **Inline CSS minified** — All CSS in `popup.html` was minified and condensed, reducing file size while preserving functionality.
- **Content script renamed guard** — Injection guard changed from `__mdownDropperInjected` to `__mdownDropperV2`.
- **Permissions expanded** — Added `activeTab`, `scripting`, and `storage` permissions; `host_permissions` now includes `<all_urls>` to support broader page interaction.
- **Improved drop target detection** — `content.js` now explicitly checks `INPUT` types (`text`, `search`, `url`, `email`) and includes a `change` event dispatch after insertion.
- **Error handling** — Repository load failures now display an error message in the UI instead of silently failing.
- **Footer count display** — Shows `—` while loading, `Error` on failure, and the file count after successful load.

### Removed

- **Hardcoded file descriptions** — The `FILE_DESCRIPTIONS` lookup table in `popup.js` was removed in favor of dynamic size display.
- **Raster PNG icons** — `icon16.png`, `icon48.png`, `icon128.png` are no longer used as the default action icon (though they remain in the `icons` object for fallback).
- **Static folder icon mapping** — The `FOLDER_ICONS` constant was removed; icons are now determined dynamically by repo and file extension.

### Technical

- **Popup JS** grew from 290 to 533 lines (+243), adding repo config, tab logic, alias expansion, and multi-repo rendering.
- **Popup HTML** grew from 346 to 1110 lines (+764), adding tab markup, expanded variable editor UI, and minified styles.
- **Content JS** shrank from 148 to 103 lines (-45), with simplified drop handling and removed verbose comments.
- **Manifest** reorganized: version bumped to 2.0.0, description updated, permissions expanded, icon declaration simplified.

---

## v1.0.0 — 2026-06-03

**Initial release of mdown-dropper.**

A Chrome Extension to browse, preview, and drag-and-drop markdown files from `ai-builders-id/mdown-collection` into any web page.

### Added

- **File listing from GitHub API** — Fetches the full file tree from `ai-builders-id/mdown-collection` using the GitHub Contents API with recursive tree traversal. Results are cached for 10 minutes in `localStorage`.
- **Grouped file display** — Files are organised into sections (Root, Standards, Minimal) with section labels, numbered prefixes, and human-readable descriptions for over 30+ known files.
- **Real-time search** — Filter files by name with a search input field; results update on every keystroke.
- **Markdown preview** — Click the preview icon to open a panel that renders the file content. Supports two tabs:
  - **Rendered** — HTML-rendered markdown via a custom `renderMarkdown()` function that supports headings, bold, italic, code blocks, inline code, links, lists, tables, and blockquotes.
  - **Raw** — Plain text view of the source markdown.
- **Variable editor** — Automatically detects `{{VARIABLE}}` placeholders in file content and displays them as editable color-coded chips. Users can click a chip or click the variable directly in the preview to fill in values. Variables are then substituted when inserting or copying content.
- **Insert into web page** — After filling variables, click "Insert to Web" to inject the processed content into the currently focused textarea, input, or contenteditable element on the active tab.
- **Drag and drop** — Each file item is draggable. Drag a file onto any textarea, input (`text`/`search`/`url`/`email`), or contenteditable element on any web page. A dashed blue overlay appears on the target element during drag, and a green flash confirms the drop.
- **Copy to clipboard** — Each file item includes a "Copy" button that copies the raw file content (with variable substitution if variables were filled) to the system clipboard.
- **Refresh** — A refresh button in the header forces a fresh fetch from the GitHub API, bypassing the 10-minute cache.
- **Visual drop overlay** — A styled overlay with "Drop markdown here" label appears when dragging over a valid target element.

### Technical

- Built with **Vanilla JS** — no build step, zero dependencies.
- **Chrome Extension Manifest V3** — Uses `action` API, `scripting` for content injection, and `chrome.storage.local` for cross-context content transfer during drag.
- **Architecture**:
  - `popup.js` (290 lines) — Core logic: GitHub API fetching, file rendering, search, preview, variable editor, and inter-tab communication.
  - `popup.html` (346 lines) — All UI markup and CSS styling (GitHub Dark theme).
  - `content.js` (148 lines) — Content script injected into all pages; handles dragover/drop events on form elements and contenteditable regions.
  - `manifest.json` — Declares permissions for GitHub API, raw content hosting, and `<all_urls>` content scripts.
- **GitHub integration** — Uses `api.github.com/repos/.../git/trees/main?recursive=1` for file listing and `raw.githubusercontent.com` for fetching file contents.
- **Icons** — 16px, 48px, and 128px PNG icons.

---

## v0.1.0 — 2026-06-03

**Project scaffold.**

- Created the repository `mdown-collection-chrome`.
- Added initial `README.md` with project title placeholder.

---

_MIT License — Copyright (c) 2026 Cloud Dark_
