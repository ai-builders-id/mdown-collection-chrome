// mdown-dropper v3 — popup.js
// File list 100% dari GitHub API, zero hard-code

// ── Repo config — satu-satunya yang boleh di-hardcode ────
const REPOS = {
  prd: {
    owner: 'ai-builders-id',
    repo:  'prd-prompt-collection',
    label: 'PRD Prompt',
    icon:  '📋',
    color: '#3fb950',
    filter: item => item.type === 'blob'
                 && item.path.endsWith('.md')
                 && item.path !== 'README.md',
    githubUrl: 'https://github.com/ai-builders-id/prd-prompt-collection',
  },
  mdown: {
    owner: 'ai-builders-id',
    repo:  'mdown-collection',
    label: 'Prompt Collection',
    icon:  '🗂️',
    color: '#58a6ff',
    filter: item => item.type === 'blob'
                 && (item.path.endsWith('.md') || item.path.endsWith('.json'))
                 && !item.path.startsWith('assets/'),
    githubUrl: 'https://github.com/ai-builders-id/mdown-collection',
  },
};

const CACHE_TTL = 10 * 60 * 1000; // 10 menit

// ── Search Aliases ────────────────────────────────────────
const SEARCH_ALIASES = {
  'cs': 'customer support',
  'prd': 'product requirements',
  'qa': 'quality assurance',
  'api': 'application programming interface',
};

// ── State ─────────────────────────────────────────────────
let activeRepo   = 'prd';  // 'prd' | 'mdown'
let allFiles     = [];
let filtered     = [];
let currentPath  = null;
let currentRepo  = null;
let rawContent   = '';
let varValues    = {};
let activeTab    = 'rendered';
let editingVar   = null;
const contentCache = new Map(); // prefetch cache for drag

// ── DOM ───────────────────────────────────────────────────
const viewList        = document.getElementById('viewList');
const viewPreview     = document.getElementById('viewPreview');
const listScroll      = document.getElementById('listScroll');
const searchInput     = document.getElementById('searchInput');
const footerCount     = document.getElementById('footerCount');
const footerLink      = document.getElementById('footerLink');
const refreshBtn      = document.getElementById('refreshBtn');
const repoTabMdown    = document.getElementById('repoTabMdown');
const repoTabPrd      = document.getElementById('repoTabPrd');
const hintDot         = document.getElementById('hintDot');

const backBtn         = document.getElementById('backBtn');
const previewFilename = document.getElementById('previewFilename');
const tabRendered     = document.getElementById('tabRendered');
const tabRaw          = document.getElementById('tabRaw');
const varsBar         = document.getElementById('varsBar');
const varsChips       = document.getElementById('varsChips');
const varsLabelToggle = document.getElementById('varsLabelToggle');
const varBadge        = document.getElementById('varBadge');
const previewScroll   = document.getElementById('previewScroll');
const pfDrag          = document.getElementById('pfDrag');
const pfCopy          = document.getElementById('pfCopy');
const pfInsert        = document.getElementById('pfInsert');
const varModal        = document.getElementById('varModal');
const vmBody          = document.getElementById('vmBody');
const vmCancel        = document.getElementById('vmCancel');
const vmApply         = document.getElementById('vmApply');

// ── GitHub API ────────────────────────────────────────────
function cacheKey(repoKey) { return `mdown_v3_${repoKey}`; }
function rawBase(cfg) { return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/main/`; }
function apiUrl(cfg)  { return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/git/trees/main?recursive=1`; }

async function fetchFileList(repoKey, force = false) {
  const cfg = REPOS[repoKey];
  const key = cacheKey(repoKey);

  if (!force) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const c = JSON.parse(raw);
        if (Date.now() - c.ts < CACHE_TTL) return c.files;
      }
    } catch (_) {}
  }

  const res = await fetch(apiUrl(cfg), { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub API ${res.status} — ${cfg.repo}`);
  const data = await res.json();

  const files = data.tree
    .filter(cfg.filter)
    .map(item => ({ path: item.path, size: item.size }));

  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), files }));
  return files;
}

async function fetchContent(repoKey, path) {
  const cfg = REPOS[repoKey];
  const res = await fetch(rawBase(cfg) + path);
  if (!res.ok) throw new Error(`Gagal fetch ${path}`);
  return await res.text();
}

// ── File display helpers (semua derived dari path, zero hard-code) ─
function getFilename(path) { return path.split('/').pop(); }

function getDisplayName(path) {
  const fname = getFilename(path);
  const stem  = fname.replace(/\.md$|\.json$/, '');
  // "PRD - Accounting" → sudah bagus
  // "00_PROJECT_CHARTER" → "00. PROJECT CHARTER" → kita split angka
  return stem.replace(/_/g, ' ');
}

function getNumberPrefix(path) {
  const stem = getFilename(path).replace(/\.md$|\.json$/, '');
  const m = stem.match(/^(\d+)[_-]/);
  return m ? m[1] : null;
}

function getNameWithoutNumber(path) {
  const stem = getFilename(path).replace(/\.md$|\.json$/, '');
  return stem.replace(/^\d+[_-]/, '').replace(/_/g, ' ');
}

function getFileIcon(path, repoKey) {
  if (path.endsWith('.json')) return '{}';
  if (repoKey === 'prd') {
    if (path.toLowerCase().includes('template')) return '📐';
    return '📋';
  }
  if (path.startsWith('standards/')) return '📐';
  if (path.startsWith('minimal/'))  return '🗂️';
  return '📄';
}

function getFolderKey(path) {
  const parts = path.split('/');
  return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
}

function getFolderLabel(folderKey, repoKey) {
  if (!folderKey) return repoKey === 'prd' ? 'PRD Collection' : 'Root';
  if (folderKey === 'standards') return 'Engineering Standards';
  if (folderKey === 'minimal')   return 'Minimal Templates';
  return folderKey;
}

function groupFiles(files) {
  const g = {};
  files.forEach(f => {
    const k = getFolderKey(f.path);
    if (!g[k]) g[k] = [];
    g[k].push(f);
  });
  return g;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

// ── Render list ───────────────────────────────────────────
function renderList(files) {
  const repoKey = activeRepo;
  footerLink.href = REPOS[repoKey].githubUrl;

  if (!files.length) {
    listScroll.innerHTML = `<div class="no-results">Tidak ada file yang cocok 🔍</div>`;
    footerCount.textContent = '0 files';
    return;
  }

  footerCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

  const groups = groupFiles(files);
  const html = [];

  Object.keys(groups)
    .sort((a, b) => !a ? -1 : !b ? 1 : a.localeCompare(b))
    .forEach(folderKey => {
      const label = getFolderLabel(folderKey, repoKey);
      html.push(`<div class="section-label">${label}</div>`);

      groups[folderKey].forEach(file => {
        const icon   = getFileIcon(file.path, repoKey);
        const num    = getNumberPrefix(file.path);
        const name   = getNameWithoutNumber(file.path);
        const size   = formatSize(file.size);
        const numHtml = num ? `<span class="file-num">${num}.</span>` : '';

        html.push(`
          <div class="file-item" draggable="true" data-path="${file.path}" data-repo="${repoKey}">
            <span class="file-icon">${icon}</span>
            <div class="file-info">
              <div class="file-name">${numHtml}${name}</div>
              ${size ? `<div class="file-desc">${size}</div>` : ''}
            </div>
            <div class="row-btns">
              <button class="row-btn preview-btn" data-path="${file.path}" data-repo="${repoKey}" title="Preview">👁</button>
              <button class="row-btn green copy-row-btn" data-path="${file.path}" data-repo="${repoKey}" title="Copy">Copy</button>
            </div>
            <span class="drag-handle">⠿</span>
          </div>`);
      });
    });

  listScroll.innerHTML = html.join('');
  attachListEvents();
}

// ── List events ───────────────────────────────────────────
function prefetchContent(repoKey, path) {
  const key = `${repoKey}:${path}`;
  if (contentCache.has(key)) return;
  contentCache.set(key, null); // mark as in-flight
  fetchContent(repoKey, path)
    .then(c => contentCache.set(key, c))
    .catch(() => contentCache.delete(key));
}

function attachListEvents() {
  document.querySelectorAll('.file-item').forEach(item => {
    const { path, repo } = item.dataset;
    const cacheKey = `${repo}:${path}`;

    // Prefetch on hover so content is ready before drag
    item.addEventListener('mouseenter', () => prefetchContent(repo, path));
    item.addEventListener('pointerdown', () => prefetchContent(repo, path));

    item.addEventListener('dragstart', e => {
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'copy';

      const cached = contentCache.get(cacheKey);
      if (cached) {
        // Content is ready — set it synchronously (same as preview drag)
        e.dataTransfer.setData('text/plain', cached);
        chrome.storage.local.set({ mdown_drag_content: cached, mdown_drag_ready: true, mdown_drag_path: path });
      } else {
        // Not yet cached — set placeholder, fetch async as fallback
        e.dataTransfer.setData('text/plain', `{{LOADING:${path}}}`);
        fetchContent(repo, path)
          .then(content => {
            contentCache.set(cacheKey, content);
            chrome.storage.local.set({ mdown_drag_content: content, mdown_drag_ready: true, mdown_drag_path: path });
          })
          .catch(err => console.warn(err));
      }
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
  });

  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openPreview(btn.dataset.repo, btn.dataset.path); });
  });

  document.querySelectorAll('.copy-row-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const { path, repo } = btn.dataset;
      btn.textContent = '...';
      try {
        const c = await fetchContent(repo, path);
        await navigator.clipboard.writeText(c);
        btn.textContent = '✓'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1500);
      } catch (_) { btn.textContent = '✗'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
    });
  });
}

// ── Repo tab switching ────────────────────────────────────
repoTabMdown.addEventListener('click', () => switchRepo('mdown'));
repoTabPrd.addEventListener('click',   () => switchRepo('prd'));

async function switchRepo(key) {
  if (activeRepo === key) return;
  activeRepo = key;
  searchInput.value = '';

  repoTabMdown.classList.toggle('active', key === 'mdown');
  repoTabPrd.classList.toggle('active',   key === 'prd');

  const cfg = REPOS[key];
  hintDot.style.background = cfg.color;
  footerLink.href = cfg.githubUrl;

  await loadRepo(key);
}

async function loadRepo(key, force = false) {
  listScroll.innerHTML = `<div class="state-wrap"><div class="spinner"></div><div class="state-text">Mengambil dari GitHub...</div></div>`;
  footerCount.textContent = '—';
  try {
    allFiles = await fetchFileList(key, force);
    filtered = allFiles;
    renderList(filtered);
  } catch (err) {
    listScroll.innerHTML = `<div class="state-wrap"><div class="state-icon">⚠️</div><div class="state-text">Gagal: ${err.message}</div></div>`;
    footerCount.textContent = 'Error';
  }
}

// ── Search ────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const rawQ = searchInput.value.trim().toLowerCase();
  if (!rawQ) {
    filtered = allFiles;
  } else {
    // Similarity match: check aliases first
    const expandedQ = SEARCH_ALIASES[rawQ] || rawQ;
    filtered = allFiles.filter(f => {
      const path = f.path.toLowerCase();
      // Match path, or match expanded query
      return path.includes(rawQ) || path.includes(expandedQ);
    });
  }
  renderList(filtered);
});

// ── Refresh ───────────────────────────────────────────────
refreshBtn.addEventListener('click', () => {
  // Refresh KEDUA repo GitHub sekaligus
  localStorage.removeItem(cacheKey('prd'));
  localStorage.removeItem(cacheKey('mdown'));
  loadRepo(activeRepo, true);
});

// ── Preview ───────────────────────────────────────────────
async function openPreview(repoKey, path) {
  currentPath = path;
  currentRepo = repoKey;
  varValues   = {};
  activeTab   = 'rendered';
  tabRendered.classList.add('active');
  tabRaw.classList.remove('active');

  viewList.classList.remove('active');
  viewPreview.classList.add('active');

  previewFilename.textContent = getDisplayName(path);
  previewScroll.innerHTML = `<div class="state-wrap"><div class="spinner"></div><div class="state-text">Loading...</div></div>`;
  varsBar.classList.remove('has-vars');

  try {
    rawContent = await fetchContent(repoKey, path);
    renderPreview();
  } catch (err) {
    previewScroll.innerHTML = `<div class="state-wrap"><div class="state-icon">⚠️</div><div class="state-text">${err.message}</div></div>`;
  }
}

backBtn.addEventListener('click', () => {
  viewPreview.classList.remove('active');
  viewList.classList.add('active');
  currentPath = null; rawContent = ''; varValues = {};
});

// ── Variable helpers ──────────────────────────────────────
// Extract ALL {{...}} patterns — apapun isinya (spasi, slash, tanda baca, dll)
function extractVars(text) {
  const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => {
    let name = m.replace(/[{}]/g, '').trim();
    // Abaikan {{LOADING:...}} — itu khusus drag
    if (name.startsWith('LOADING:')) return null;
    return name;
  }).filter(Boolean))];
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Hitung berapa kali {{name}} muncul di text
function countVar(text, name) {
  const re = new RegExp(`\\{\\{${escapeRegex(name)}\\}\\}`, 'g');
  return (text.match(re) || []).length;
}

// varValues[name] = array nilai per-kemunculan. Occurrence ke-i diisi vals[i];
// yang kosong tetap dibiarkan sebagai {{name}}.
function applyVars(text) {
  let out = text;
  for (const k of Object.keys(varValues)) {
    const vals = varValues[k];
    if (!Array.isArray(vals)) continue;
    let i = 0;
    const re = new RegExp(`\\{\\{${escapeRegex(k)}\\}\\}`, 'g');
    out = out.replace(re, m => {
      const v = vals[i++];
      return (v !== undefined && v !== '') ? v : m;
    });
  }
  return out;
}

// ── Markdown renderer ─────────────────────────────────────
function renderMarkdown(md) {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```[\w]*\n([\s\S]*?)```/g, (_, c) => `<pre><code>${c.trimEnd()}</code></pre>`)
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/^&gt; (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^---+$/gm,'<hr/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank">$1</a>')
    .replace(/^\s*[-*] (.+)$/gm,'<li>$1</li>')
    .replace(/^\s*\d+\. (.+)$/gm,'<li>$1</li>')
    .replace(/^\|(.+)\|$/gm,(_, row) => {
      const cells = row.split('|').map(c => c.trim()).filter(c => c && !c.match(/^[-:]+$/));
      if (!cells.length) return '';
      return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
    })
    .replace(/^([^<\n].+)$/gm,'<p>$1</p>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`)
    .replace(/(<tr>.*<\/tr>\n?)+/gs, m => `<table><tbody>${m}</tbody></table>`)
    .replace(/\n/g,'');
}

function renderPreview() {
  const vars    = extractVars(rawContent);
  const content = applyVars(rawContent);

  // Vars bar (collapsible dengan badge + toggle)
  if (vars.length) {
    varsBar.classList.add('has-vars');
    varsBar.classList.add('collapsed'); // start collapsed
    varBadge.textContent = vars.length;
    varsChips.innerHTML = vars.map(v =>
      `<span class="var-chip" data-var="${v}">{{${v}}}</span>`
    ).join('');
    varsChips.querySelectorAll('.var-chip').forEach(c =>
      c.addEventListener('click', () => openVarModal(c.dataset.var))
    );
  } else {
    varsBar.classList.remove('has-vars');
    varsChips.innerHTML = '';
  }

  if (activeTab === 'rendered') {
    let html = renderMarkdown(content);
    // highlight remaining unfilled vars in rendered view
    vars.forEach(v => {
      const re = new RegExp(`\\{\\{${escapeRegex(v)}\\}\\}`, 'g');
      html = html.replace(re, `<span class="var-rendered" data-var="${escapeHtml(v)}">{{${v}}}</span>`);
    });
    previewScroll.innerHTML = `<div class="md-body">${html}</div>`;
  } else {
    // raw: escape then highlight vars
    let escaped = rawContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    vars.forEach(v => {
      const re = new RegExp(`\\{\\{${escapeRegex(v)}\\}\\}`, 'g');
      escaped = escaped.replace(re, `<span class="var-highlight" data-var="${escapeHtml(v)}">{{${v}}}</span>`);
    });
    previewScroll.innerHTML = `<div class="raw-body">${escaped}</div>`;
  }

  previewScroll.querySelectorAll('[data-var]').forEach(el =>
    el.addEventListener('click', () => openVarModal(el.dataset.var))
  );
}

// ── Tab switching ─────────────────────────────────────────
tabRendered.addEventListener('click', () => {
  activeTab = 'rendered';
  tabRendered.classList.add('active'); tabRaw.classList.remove('active');
  renderPreview();
});
tabRaw.addEventListener('click', () => {
  activeTab = 'raw';
  tabRaw.classList.add('active'); tabRendered.classList.remove('active');
  renderPreview();
});

// ── Vars bar toggle (collapsible) ────────────────────────
varsLabelToggle.addEventListener('click', () => {
  varsBar.classList.toggle('collapsed');
});

// ── Var modal (single variable — klik {{a}} isi {{a}} aja) ──
function openVarModal(varName) {
  const count = countVar(rawContent, varName) || 1;
  const vals  = Array.isArray(varValues[varName]) ? varValues[varName] : [];
  const numbered = count > 1; // tampilkan nomor kalau muncul >1 kali

  vmBody.innerHTML = Array.from({ length: count }, (_, i) => {
    const val = vals[i] || '';
    const tag = numbered ? ` <span class="vm-field-num">#${i + 1}</span>` : '';
    return `<div class="vm-field">
      <div class="vm-field-label">
        <span class="vm-label-brackets">{{</span>${escapeHtml(varName)}<span class="vm-label-brackets">}}</span>${tag}
      </div>
      <input type="text" class="vm-field-input${val ? ' vm-filled' : ''}" data-idx="${i}" value="${escapeHtml(val)}" placeholder="Isi {{${escapeHtml(varName)}}}${numbered ? ' #' + (i + 1) : ''}..."/>
    </div>`;
  }).join('');

  editingVar = varName;
  varModal.classList.add('open');
  setTimeout(() => {
    const input = vmBody.querySelector('.vm-field-input');
    if (input) input.focus();
  }, 80);
}

function closeVarModal() {
  varModal.classList.remove('open');
  editingVar = null;
}
vmCancel.addEventListener('click', closeVarModal);
varModal.addEventListener('click', e => { if (e.target === varModal) closeVarModal(); });

vmApply.addEventListener('click', () => {
  if (editingVar) {
    const inputs = [...vmBody.querySelectorAll('.vm-field-input')];
    varValues[editingVar] = inputs.map(inp => inp.value.trim());
  }
  closeVarModal();
  renderPreview();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && varModal.classList.contains('open') && varModal.contains(e.target)) {
    vmApply.click();
  }
  if (e.key === 'Escape' && varModal.classList.contains('open')) {
    closeVarModal();
  }
});

// ── Preview footer actions ────────────────────────────────
function getFinalContent() { return applyVars(rawContent); }

pfDrag.addEventListener('dragstart', e => {
  const content = getFinalContent();
  e.dataTransfer.setData('text/plain', content);
  e.dataTransfer.effectAllowed = 'copy';
  chrome.storage.local.set({ mdown_drag_content: content, mdown_drag_ready: true });
});

pfCopy.addEventListener('click', async () => {
  await navigator.clipboard.writeText(getFinalContent());
  pfCopy.textContent = '✓ Copied!';
  setTimeout(() => { pfCopy.textContent = '📋 Copy'; }, 1500);
});

pfInsert.addEventListener('click', () => {
  const content = getFinalContent();
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (c) => {
        const el = document.activeElement;
        if (!el) { alert('Klik dulu field yang ingin diisi.'); return; }
        if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
          const s = el.selectionStart || 0, e = el.selectionEnd || 0;
          el.value = el.value.slice(0, s) + c + el.value.slice(e);
          el.selectionStart = el.selectionEnd = s + c.length;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (el.isContentEditable) {
          document.execCommand('insertText', false, c);
        } else { alert('Klik dulu textarea/input yang ingin diisi.'); }
      },
      args: [content]
    });
  });
});

// ── Init ─────────────────────────────────────────────────
hintDot.style.background = REPOS[activeRepo].color;
footerLink.href = REPOS[activeRepo].githubUrl;
loadRepo(activeRepo);
