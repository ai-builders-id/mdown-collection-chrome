# Privacy Policy

**Effective Date:** June 24, 2026  
**Extension:** blinker  
**Version:** 2.0.1  

---

## 1. Introduction

blinker is a Chrome extension that lets you browse, preview, and insert markdown prompts and templates from public GitHub repositories into any web page.

This Privacy Policy explains how blinker handles your data. By using the extension, you agree to the practices described below.

---

## 2. No Personal Data Collection

blinker **does NOT collect, store, transmit, or share any personal data** — period.

- **No analytics** — No tracking code, third-party analytics, or beacons.
- **No accounts** — No registration or login required.
- **No backend** — We operate no servers. All communication happens directly between your browser and public GitHub services.
- **No logs** — We do not record usage history, files you open, or actions you take.

---

## 3. Data Storage (Local Only)

All data stored by blinker stays **on your device** and is never sent to any server (except the explicit GitHub fetches described in Section 4).

| Storage | What | Why | Duration |
|---------|------|-----|----------|
| `localStorage` (browser) | Cached file list (paths + sizes) from GitHub repos | Avoid re-fetching on every popup open | 10 minutes TTL; auto-expires |
| `chrome.storage.local` | Markdown content being dragged | Transfer content from popup to web page during drag-and-drop | Written on drag start, **deleted immediately** after drop |
| In-memory (`Map`) | Prefetched file content | Instant preview on hover | Cleared when popup closes |

---

## 4. Third-Party Services: GitHub API

blinker fetches data exclusively from the developer's **public** GitHub repositories:

| Endpoint | Purpose |
|----------|---------|
| `api.github.com/repos/ai-builders-id/*/git/trees/main?recursive=1` | Fetch file listing |
| `raw.githubusercontent.com/ai-builders-id/*/main/` | Fetch markdown file content |
| `fonts.googleapis.com` / `fonts.gstatic.com` | Load extension UI fonts |

**Important:**
- Only **public** repositories are accessed — no access to private repos or your GitHub account.
- Requests are **anonymous** (not authenticated as any user) and subject to GitHub's unauthenticated rate limit (~60 req/hour).
- The extension sends **no personally identifiable information** to GitHub.
- GitHub's own [Privacy Policy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) applies when accessing their services.
- Google Fonts are loaded as static CSS — no font data is sent to Google beyond the standard browser request.

---

## 5. Permission Justification

| Permission | Why It's Needed |
|------------|----------------|
| `activeTab` | Access the active tab so "Insert to Web" can write content into input fields. Temporary — only while the popup is open. |
| `scripting` | Inject text-insertion code into the active web page. |
| `storage` | Transfer drag-and-drop content between the popup and content script via `chrome.storage.local`. |
| `https://api.github.com/*` | Fetch file listings from public GitHub repos. |
| `https://raw.githubusercontent.com/*` | Download markdown file content. |
| `<all_urls>` | Content script runs on every page so drag-and-drop works anywhere. The script **only** listens for drop events — it never reads or modifies page content. |

---

## 6. Your Rights & Control

- **Clear cache** — Click the Refresh (↻) button in the popup, or clear browser storage at `chrome://extensions` → blinker → Details → Clear storage.
- **Revoke permissions** — Disable or remove the extension anytime via `chrome://extensions`.
- **No data to request** — Since we collect nothing, there is nothing to access, correct, or delete from our side.

---

## 7. COPPA Compliance

blinker collects **no personal information from any user**, including children under 13. No parental consent is needed; no children's data is collected, used, or shared.

---

## 8. Changes to This Policy

Updates will be reflected by a new "Effective Date" at the top of this document and noted in extension release notes.

---

## 9. Contact

- **GitHub Issues:** [github.com/ai-builders-id/mdown-collection/issues](https://github.com/ai-builders-id/mdown-collection/issues)  
- **Extension Repository:** [github.com/ai-builders-id/mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome)

We will respond within 30 days.

---

*This policy is written in English. A bilingual version (English + Indonesian) is available at [`docs/legal/privacy.md`](docs/legal/privacy.md).*
