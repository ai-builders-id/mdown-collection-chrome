// ============================================================
// mdown-dropper — popup.js
// Fetches file list from GitHub API, renders draggable items,
// and injects content into the active tab via content.js
// ============================================================

const REPO_OWNER = 'ai-builders-id';
const REPO_NAME  = 'mdown-collection';
const RAW_BASE   = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/`;
const API_BASE   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;
const CACHE_KEY  = 'mdown_filelist_cache';
const CACHE_TTL  = 10 * 60 * 1000; // 10 minutes

// Short human-readable descriptions for numbered files
const FILE_DESCRIPTIONS = {
  '00_PROJECT_CHARTER':            'Vision, scope, success criteria',
  '01_PRD':                        'Product requirements',
  '02_BRD':                        'Business requirements',
  '03_FRD':                        'Functional requirements',
  '04_TRD':                        'Technical requirements',
  '05_ARCHITECTURE':               'System architecture',
  '06_IMPLEMENTATION_PLAN':        'Build plan & phases',
  '07_MASTER_CHECKLIST':           'Release readiness checklist',
  '08_ROADMAP':                    'Roadmap',
  '09_OPEN_SOURCE_STANDARD':       'OSS posture',
  '10_RISK_REGISTER':              'Risk tracking',
  '11_DECISIONS':                  'Decision log (ADR-style)',
  '12_TEST_STRATEGY':              'Test strategy',
  '13_GLOSSARY':                   'Domain glossary',
  '14_SECURITY_THREAT_MODEL':      'Threat model',
  '15_PROTOCOL_DRAFT':             'IPC / daemon protocol',
  '16_CONFIG_REFERENCE':           'Config file reference',
  '17_DEVELOPER_SETUP':            'Dev environment setup',
  '18_INSTALLATION':               'End-user install guide',
  '19_REQUIREMENTS_TRACEABILITY':  'Traceability matrix',
  '20_UI_ADAPTATION':              'Adapting another product UI',
  '21_UI_FEATURE_PARITY_CHECKLIST':'UI parity checklist',
  '22_UI_STATE_PROTOCOL_CONTRACT': 'UI ↔ daemon state contract',
  '23_UI_DESIGN_SYSTEM':           'UI design system',
  '24_CONTRIBUTOR_SKILLS':         'Skills matrix for contributors',
  '25_MEMORY_CONCEPT':             'Agent memory model',
  '26_AVATAR_ENGINE':              'Avatar rendering engine',
  '27_WORKSPACE_ARCHITECTURE':     'Multi-workspace agent runtime',
  '28_PLATFORM_BASELINE':          'OS / runtime baseline',
  '29_PROTOCOL_FREEZE':            'Protocol stability policy',
  '30_STABLE_CLI':                 'CLI stability contract',
  '31_STORAGE_FORMAT':             'On-disk storage format',
  'BLUEPRINT':                     'High-level shape of the system',
  'KNOWN_LIMITATIONS':             'Known limitations',
  'README':                        'Repository overview',
  'TEMPLATE_GUIDE':                'Full placeholder reference',
  'progress':                      'Progress tracker JSON',
};

// Group labels for subfolders
const FOLDER_ICONS = {
  '':          '📄',
  'minimal':   '🗂️',
  'standards': '📐',
};

let allFiles = [];
let filtered = [];

// ── DOM refs ──────────────────────────────────────────────
const mainContent  = document.getElementById('mainContent');
const searchInput  = document.getElementById('searchInput');
const footerCount  = document.getElementById('footerCount');
const refreshBtn   = document.getElementById('refreshBtn');

// ── Helpers ───────────────────────────────────────────────
function stemName(filename) {
  return filename.replace(/\.md$/, '').replace(/\.json$/, '');
}

function getDesc(filename) {
  const stem = stemName(filename);
  return FILE_DESCRIPTIONS[stem] || '';
}

function getFileIcon(path) {
  if (path.endsWith('.json')) return '{}';
  if (path.startsWith('standards/')) return '📐';
  if (path.startsWith('minimal/'))  return '🗂️';
  return '📄';
}

function groupFiles(files) {
  const groups = {};
  files.forEach(f => {
    const parts = f.path.split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    if (!groups[folder]) groups[folder] = [];
    groups[folder].push(f);
  });
  return groups;
}

function folderLabel(key) {
  if (!key) return 'Root';
  if (key === 'standards') return 'Engineering Standards';
  if (key === 'minimal') return 'Minimal Templates';
  if (key.startsWith('assets')) return null; // skip assets
  return key;
}

// ── Fetch file list ───────────────────────────────────────
async function fetchFileList(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache = JSON.parse(raw);
        if (Date.now() - cache.ts < CACHE_TTL) return cache.files;
      }
    } catch (_) {}
  }

  const res = await fetch(API_BASE, {
    headers: { Accept: 'application/vnd.github+json' }
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();

  const files = data.tree
    .filter(item => item.type === 'blob' && (item.path.endsWith('.md') || item.path.endsWith('.json')))
    .filter(item => !item.path.startsWith('assets/'))
    .map(item => ({ path: item.path, sha: item.sha }));

  localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), files }));
  return files;
}

// ── Fetch raw content for a file ──────────────────────────
async function fetchContent(path) {
  const res = await fetch(RAW_BASE + path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return await res.text();
}

// ── Render ────────────────────────────────────────────────
function renderList(files) {
  if (!files.length) {
    mainContent.innerHTML = `<div class="no-results">Tidak ada file yang cocok 🔍</div>`;
    footerCount.textContent = '0 files';
    return;
  }

  footerCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

  const groups = groupFiles(files);
  const html = [];

  const orderedKeys = Object.keys(groups).sort((a, b) => {
    if (!a) return -1;
    if (!b) return 1;
    return a.localeCompare(b);
  });

  orderedKeys.forEach(folder => {
    const label = folderLabel(folder);
    if (label === null) return;

    html.push(`<div class="section-label">${label}</div>`);

    groups[folder].forEach(file => {
      const filename = file.path.split('/').pop();
      const stem     = stemName(filename);
      const desc     = getDesc(filename);
      const icon     = getFileIcon(file.path);

      // Extract leading number for display
      const numMatch = stem.match(/^(\d+)_/);
      const numPart  = numMatch ? `<span class="file-number">${numMatch[1]}.</span>` : '';
      const namePart = stem.replace(/^\d+_/, '').replace(/_/g, ' ');

      html.push(`
        <div class="file-item"
             draggable="true"
             data-path="${file.path}"
             data-name="${filename}"
             title="Drag ke halaman web, atau klik kanan untuk copy">
          <span class="file-icon">${icon}</span>
          <div class="file-info">
            <div class="file-name">${numPart}${namePart}</div>
            ${desc ? `<div class="file-desc">${desc}</div>` : ''}
          </div>
          <button class="copy-btn" data-path="${file.path}" title="Copy konten">Copy</button>
          <span class="drag-handle">⠿</span>
        </div>
      `);
    });
  });

  mainContent.innerHTML = html.join('');
  attachEvents();
}

// ── Event Listeners ───────────────────────────────────────
function attachEvents() {
  // DRAG START
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('dragstart', async (e) => {
      const path = item.dataset.path;
      item.classList.add('dragging');

      // Immediately set text/plain so drag works everywhere
      e.dataTransfer.setData('text/plain', `[Loading ${path}...]`);
      e.dataTransfer.effectAllowed = 'copy';

      // Fetch content async and store for drop
      try {
        const content = await fetchContent(path);
        // Store in sessionStorage keyed by path for content.js to read
        sessionStorage.setItem('mdown_drag_content', content);
        sessionStorage.setItem('mdown_drag_path', path);
        // Also update dataTransfer if still dragging (may not work in all browsers)
        e.dataTransfer.setData('text/plain', content);
      } catch (err) {
        console.warn('Could not prefetch content:', err);
      }
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
    });
  });

  // COPY BUTTON
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const path = btn.dataset.path;
      btn.textContent = '...';
      try {
        const content = await fetchContent(path);
        await navigator.clipboard.writeText(content);
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1500);
      } catch (err) {
        btn.textContent = '✗';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      }
    });
  });
}

// ── Search ────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  filtered = q
    ? allFiles.filter(f => f.path.toLowerCase().includes(q))
    : allFiles;
  renderList(filtered);
});

// ── Refresh ───────────────────────────────────────────────
refreshBtn.addEventListener('click', () => {
  localStorage.removeItem(CACHE_KEY);
  init(true);
});

// ── Init ─────────────────────────────────────────────────
async function init(forceRefresh = false) {
  mainContent.innerHTML = `
    <div class="state-wrap">
      <div class="spinner"></div>
      <div class="state-text">${forceRefresh ? 'Memperbarui dari GitHub...' : 'Mengambil daftar file...'}</div>
    </div>`;

  try {
    allFiles = await fetchFileList(forceRefresh);
    filtered = allFiles;
    renderList(filtered);
  } catch (err) {
    mainContent.innerHTML = `
      <div class="state-wrap">
        <div class="state-icon">⚠️</div>
        <div class="state-text">Gagal memuat: ${err.message}<br><br>Periksa koneksi internet.</div>
      </div>`;
    footerCount.textContent = 'Error';
  }
}

init();
