# Contributing to Blinker

Thank you for considering contributing to **Blinker** — a Chrome extension for browsing, previewing, variable-editing, and drag-dropping markdown prompts and templates from GitHub into any web page.

We welcome contributions of all forms: bug reports, feature requests, documentation improvements, code changes, and community support. This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Fork & Clone](#fork--clone)
   - [Branch Naming](#branch-naming)
3. [Contribution Workflow](#contribution-workflow)
4. [Pull Request Guidelines](#pull-request-guidelines)
   - [Title Format](#title-format)
   - [Description Template](#description-template)
   - [Screenshots](#screenshots)
   - [PR Size](#pr-size)
5. [Code Standards](#code-standards)
   - [JavaScript (ES6+ Vanilla)](#javascript-es6-vanilla)
   - [HTML](#html)
   - [CSS](#css)
   - [Commit Conventions](#commit-conventions)
6. [Issue Reporting](#issue-reporting)
   - [Bug Report Template](#bug-report-template)
   - [Feature Request Template](#feature-request-template)
   - [Security Issues](#security-issues)
7. [Testing Requirements](#testing-requirements)
8. [Community](#community)
   - [Channels](#channels)
   - [Recognition](#recognition)
   - [Maintainers](#maintainers)

---

## Code of Conduct

This project is governed by a **code of respect**. We expect all contributors — regardless of background, identity, or experience level — to interact with one another professionally and constructively.

- **Be welcoming** — every contributor is someone who took time to help.
- **Be respectful** — critique code, not people.
- **Be collaborative** — we all share the goal of making Blinker better.
- **Ask for help** — there are no stupid questions.

Unacceptable behavior (harassment, trolling, personal attacks, or any form of discrimination) will not be tolerated. If you experience or witness such behavior, please contact the maintainers directly via the contact information in the [Maintainers](#maintainers) section.

---

## Getting Started

### Prerequisites

Before you begin, ensure your environment meets the following requirements:

| Requirement | Details |
|-------------|---------|
| **Google Chrome** | Version 88+ (required for Manifest V3 support) |
| **Git** | Version 2.30+ — verify with `git --version` |
| **Code Editor** | VS Code recommended (extensions: ESLint, Prettier) |
| **Node.js** | Optional — only if adding tooling. The extension itself has zero external dependencies |

No package manager is needed. There is no `npm install`, no `package.json`, and no build step.

### Fork & Clone

1. Fork the repository on GitHub: [ai-builders-id/mdown-collection-chrome](https://github.com/ai-builders-id/mdown-collection-chrome)
2. Clone your fork locally:

   ```bash
   git clone https://github.com/<your-username>/mdown-collection-chrome.git
   cd mdown-collection-chrome
   ```

3. Add the upstream repository as a remote:

   ```bash
   git remote add upstream https://github.com/ai-builders-id/mdown-collection-chrome.git
   ```

4. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode** (toggle in the top-right corner)
   - Click **"Load unpacked"** and select the cloned folder
   - The Blinker icon should appear in your toolbar

### Branch Naming

All work must be done on a feature branch. Branch names follow a consistent pattern:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/search-by-category` |
| `fix/` | Bug fixes | `fix/double-overlay-on-drop` |
| `docs/` | Documentation changes | `docs/api-reference-update` |
| `refactor/` | Code restructuring | `refactor/extract-variable-parser` |
| `style/` | CSS or formatting changes | `style/popup-responsive-width` |
| `perf/` | Performance improvements | `perf/lazy-load-file-content` |
| `chore/` | Maintenance tasks | `chore/bump-version-2-1-0` |

Branch from `main` and use lowercase kebab-case:

```bash
git checkout -b feat/your-feature-name
```

---

## Contribution Workflow

We follow a structured workflow to keep things organized and transparent.

```
Issue → Discuss → Assign → Branch → Develop → PR → Review → Merge
```

### Step 1: Open or Find an Issue

Before writing any code, check if an issue already exists for what you want to work on. If not, open one (see [Issue Reporting](#issue-reporting)).

### Step 2: Discuss

For non-trivial changes, start a discussion on the issue first. This prevents wasted effort — a maintainer or fellow contributor might have valuable input on the approach, or someone else might already be working on it.

### Step 3: Get Assigned

Comment on the issue to express interest. A maintainer will assign it to you. This signals to others that the issue is being worked on.

### Step 4: Create a Branch

Create a branch from `main` using the naming convention above.

### Step 5: Develop

Make your changes. Follow the [Code Standards](#code-standards) and [Testing Requirements](#testing-requirements). Keep commits small and logical.

```bash
# Keep your branch up to date with upstream
git fetch upstream
git rebase upstream/main
```

### Step 6: Open a Pull Request

Push your branch and open a PR against the `main` branch of the original repository. Fill in the [PR template](#description-template).

### Step 7: Code Review

At least one maintainer will review your PR. Expect feedback — this is normal and healthy. Address all review comments, push updates to the same branch, and the PR will update automatically.

### Step 8: Merge

Once approved, a maintainer will merge your PR. Congratulations, and thank you.

---

## Pull Request Guidelines

### Title Format

PR titles follow the same convention as commits:

```
<type>: <brief description>
```

Examples:
- `feat: add search alias expansion for common terms`
- `fix: prevent content script double injection on navigated pages`
- `docs: update installation instructions for Chrome Web Store`

### Description Template

Include the following in every PR description:

```markdown
## Summary
<!-- What does this PR do? 1-3 sentences. -->

## Related Issue
<!-- Link to the issue this resolves, e.g. "Closes #42" -->

## Changes
<!-- List the key changes made -->
- Change 1
- Change 2

## Testing
<!-- Describe how you tested these changes -->
- [ ] Manual smoke test passed
- [ ] Regression test on supported pages

## Screenshots / Screen Recording
<!-- If UI changes were made, include before/after screenshots -->
```

### Screenshots

Include screenshots or screen recordings for any UI changes:

- **Before**: The existing state
- **After**: What your change looks like
- **Popup state**: Especially important for changes to the list, preview, or variable editor views

### PR Size

**Keep PRs focused and small.** A single PR should address one concern:

- **Good**: A PR that adds variable editor undo support
- **Too broad**: A PR that adds variable editor undo, refactors the cache layer, and updates three unrelated UI components

If your change exceeds ~300 lines, consider splitting it into smaller, logical PRs. Small PRs are reviewed faster and have a higher chance of being merged cleanly.

---

## Code Standards

### JavaScript (ES6+ Vanilla)

Blinker uses vanilla JavaScript with no frameworks or build tools. All code must follow ES6+ conventions.

#### Formatting

| Rule | Standard |
|------|----------|
| Indentation | 2 spaces (no tabs) |
| Quotes | Single quotes for strings: `'hello'` |
| Semicolons | Required at the end of every statement |
| Spacing | One space after `function`, around operators, after commas |
| Braces | Egyptian style (opening brace on the same line) |

```javascript
// Correct
function fetchData() {
  return result;
}

if (condition) {
  doSomething();
}
```

#### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Variables & functions | `camelCase` | `activeRepo`, `fetchFileList()` |
| Constants | `UPPER_SNAKE_CASE` | `CACHE_TTL`, `SEARCH_ALIASES` |
| Config objects | `PascalCase` | `REPOS` |
| Event handlers | Descriptive verb | `attachListEvents()`, `openPreview()` |

#### Variable Declarations

- Use `const` for values that are never reassigned
- Use `let` only when reassignment is necessary
- **Never use `var`**
- One declaration per statement

```javascript
// Correct
const activeRepo = 'prd';
let filtered = [];

// Incorrect
var old = 'style';
const a = 1, b = 2;
```

#### Other Rules

- **Arrow functions**: Prefer arrow functions for callbacks; use `() => { ... }` for multi-line, `() => expr` for single-expression bodies
- **Async/await**: All I/O operations use `async/await` with `try/catch` error handling — avoid `.then()` chains
- **Strict equality**: Always use `===` and `!==`; never `==` or `!=`
- **Array methods**: Prefer `.map()`, `.filter()`, `.reduce()` over manual `for` loops
- **No external dependencies**: Do not add npm packages, CDN scripts, or external libraries

### HTML

- Use semantic `div` elements with descriptive class names
- `id` for unique elements (JavaScript hooks), `class` for reusable styling
- Data attributes with `data-` prefix for DOM state: `data-path`, `data-repo`, `data-var`
- Double quotes for HTML attributes
- Self-closing void elements without trailing slash: `<input>` not `<input />`

### CSS

- All CSS is inline in a single `<style>` block in `popup.html` — no external CSS files
- Class naming: `lowercase-with-dashes` (e.g., `.file-item`, `.preview-header`)
- No CSS frameworks — everything is custom
- Box-sizing: `* { box-sizing: border-box; }`
- Color palette follows the GitHub Dark theme:
  - Backgrounds: `#0d1117`, `#161b22`
  - Borders: `#21262d`, `#30363d`
  - Text: `#e6edf3`, `#c9d1d9`, `#8b949e`, `#484f58`
  - Accents: `#58a6ff` (blue), `#3fb950` (green), `#ffa657` (orange)

### Commit Conventions

We use **Conventional Commits** for all commit messages.

```
<type>: <description in present tense, imperative mood>
```

#### Allowed Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | A new feature | `feat: add search alias expansion for common terms` |
| `fix` | A bug fix | `fix: prevent double overlay on nested drop targets` |
| `refactor` | Code change with no functional change | `refactor: extract variable extraction to helper function` |
| `style` | Formatting, CSS changes | `style: adjust popup width to 400px` |
| `docs` | Documentation only | `docs: add development guide` |
| `perf` | Performance improvement | `perf: add content prefetch on hover` |
| `chore` | Maintenance (version bumps, config changes) | `chore: update manifest version to 2.0.0` |

#### Commit Rules

1. **Subject line**: Maximum 72 characters, present tense, imperative mood
2. **Body** (optional): Add after a blank line, wrapped at 72 characters
3. **Issue references**: Include `Closes #N` or `Ref #N` in the body when applicable

```bash
git commit -m 'feat: add similarity search using keyword expansion

Search now expands common abbreviations (cs -> customer support,
prd -> product requirements) to improve discoverability.

Closes #42'
```

#### History Example

```
041ea39 feat: rename to blinker, reorder tabs, and add similarity search
8d821a9 Add mdown-dropper Chrome extension
0b987c7 Initial commit
```

---

## Issue Reporting

### Bug Report Template

When reporting a bug, please include as much of the following information as possible:

```markdown
## Description
<!-- A clear and concise description of the bug -->

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
<!-- What you expected to happen -->

## Actual Behavior
<!-- What actually happened -->

## Screenshots / Screen Recording
<!-- If applicable, add visual evidence -->

## Environment
- Chrome version: <!-- e.g., 125.0.6422.142 -->
- Blinker version: <!-- from manifest.json -->
- OS: <!-- e.g., Windows 11, macOS 14.5 -->

## Console Errors
<!-- Open DevTools (right-click popup → Inspect) and paste any red errors -->
```

### Feature Request Template

```markdown
## Problem Statement
<!-- What problem would this feature solve? -->

## Proposed Solution
<!-- Describe the feature you'd like, as specifically as possible -->

## Alternative Solutions
<!-- Any alternative approaches you've considered -->

## Additional Context
<!-- Screenshots, mockups, or references to other tools that do this -->
```

### Security Issues

**Do not open a public issue for security vulnerabilities.**

If you discover a security-related bug:

1. **Do not** disclose it publicly on GitHub or in any public channel
2. **Do not** create a public issue describing the vulnerability

Instead, send a private report to the maintainers at the contact information listed in the [Maintainers](#maintainers) section, or use GitHub's [Security Advisory](https://github.com/ai-builders-id/mdown-collection-chrome/security/advisories) feature.

We will acknowledge receipt within 48 hours and work toward a fix before any public disclosure.

---

## Testing Requirements

Blinker is a Chrome extension with no test framework — all testing is currently manual and exploratory. Every contribution must be verified before submission.

### Smoke Test Checklist

Run through these checks after your changes. Verify each item before marking your PR as ready for review.

- [ ] Popup opens without JavaScript errors (check DevTools console)
- [ ] File list loads from both repositories (PRD & Prompt Collection)
- [ ] Search filtering works correctly
- [ ] Preview opens with both Rendered and Raw tabs
- [ ] Variable detection (`{{VARIABLE}}`) works in file content
- [ ] Variable editor modal opens and accepts input
- [ ] Drag item to a textarea on any web page works
- [ ] Copy to clipboard works
- [ ] Insert to web (via scripting API) works
- [ ] Refresh button clears cache and re-fetches
- [ ] Cache expiration works (10-minute TTL)
- [ ] Content script injects without errors
- [ ] Drop overlay appears over valid drop targets (textarea, input, contentEditable)
- [ ] Dropped content is inserted at the correct cursor position

### Regression Test Checklist

Before marking a PR as final, test on the following page types:

- **GitHub issue comment textarea** — standard textarea
- **Google Docs** — contentEditable
- **Twitter / X** — tweet compose box
- **Standard HTML form** — `<input type="text">`, `<textarea>`
- **Page with no drop targets** — should silently no-op, no crashes

### Console Monitoring

Always inspect the DevTools console during testing:

- **Errors** (red): Must be zero
- **Warnings** (yellow): Should be zero or documented as expected
- **Network requests**: Should only target `api.github.com` and `raw.githubusercontent.com`

### When Tests Are Not Possible

If a change is inherently hard to test (e.g., a Chrome API edge case), document the testing gap in the PR description so reviewers can verify manually.

---

## Community

### Channels

| Channel | Purpose | Link |
|---------|---------|------|
| **GitHub Issues** | Bug reports, feature requests, task tracking | [Issues page](https://github.com/ai-builders-id/mdown-collection-chrome/issues) |
| **GitHub Discussions** | Questions, ideas, general conversation | [Discussions page](https://github.com/ai-builders-id/mdown-collection-chrome/discussions) |
| **Pull Requests** | Code review and contribution discussion | [PRs page](https://github.com/ai-builders-id/mdown-collection-chrome/pulls) |

### Recognition

Every contributor who has a pull request merged will be recognized:

- **Name and profile** added to the project's README contributors section
- **Mentioned in the release notes** of the release that includes their contribution

We believe in celebrating contributions, large and small. Documentation, bug reports, code reviews, and community support are all equally valued.

### Maintainers

Current maintainers of Blinker:

| Name | Role | Contact |
|------|------|---------|
| Cloud Dark | Lead maintainer | [GitHub](https://github.com/cloud-dark) |

If you have questions about the contribution process, need guidance on an issue, or want to discuss a significant feature before investing time, reach out to the maintainers via GitHub Discussions or tag them on your issue/PR.

---

## Quick Reference

```bash
# Fork the repo, then:
git clone https://github.com/<your-username>/mdown-collection-chrome.git
cd mdown-collection-chrome

# Keep your fork in sync
git remote add upstream https://github.com/ai-builders-id/mdown-collection-chrome.git
git fetch upstream

# Start working
git checkout -b feat/your-feature-name

# Make changes, then commit
git add <files>
git commit -m 'feat: what your change does'

# Push and open a PR
git push origin feat/your-feature-name
```

---

*Thank you for contributing to Blinker. Every issue filed, every typo fixed, and every feature added makes this project better for everyone.*
