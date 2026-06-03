// ============================================================
// mdown-dropper — content.js
// Injected into every page. Listens for drops on
// text inputs / textareas / contenteditable elements
// and pastes the markdown content.
// ============================================================

(function () {
  if (window.__mdownDropperInjected) return;
  window.__mdownDropperInjected = true;

  let dropOverlay = null;
  let isDraggingMdown = false;

  // ── Visual drop overlay ───────────────────────────────
  function createOverlay(el) {
    removeOverlay();
    const rect = el.getBoundingClientRect();
    dropOverlay = document.createElement('div');
    Object.assign(dropOverlay.style, {
      position:      'fixed',
      top:           `${rect.top}px`,
      left:          `${rect.left}px`,
      width:         `${rect.width}px`,
      height:        `${rect.height}px`,
      border:        '2px dashed #58a6ff',
      borderRadius:  '6px',
      background:    'rgba(88, 166, 255, 0.08)',
      pointerEvents: 'none',
      zIndex:        '2147483647',
      transition:    'opacity 0.15s',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'center',
    });

    const label = document.createElement('div');
    Object.assign(label.style, {
      background:   'rgba(13, 17, 23, 0.85)',
      color:        '#58a6ff',
      borderRadius: '6px',
      padding:      '4px 10px',
      fontSize:     '12px',
      fontFamily:   'monospace',
      pointerEvents:'none',
    });
    label.textContent = '📄 Drop markdown here';
    dropOverlay.appendChild(label);
    document.body.appendChild(dropOverlay);
  }

  function removeOverlay() {
    if (dropOverlay) {
      dropOverlay.remove();
      dropOverlay = null;
    }
  }

  // ── Target detection ──────────────────────────────────
  function isDropTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT' && ['text', 'search', 'url', 'email'].includes(el.type)) return true;
    if (el.isContentEditable) return true;
    return false;
  }

  // ── Get content from drag event ───────────────────────
  async function getDropContent(e) {
    // 1. Try dataTransfer text (works if fetched synchronously)
    const dtText = e.dataTransfer.getData('text/plain');
    if (dtText && !dtText.startsWith('[Loading ')) return dtText;

    // 2. Fallback: fetch from GitHub directly using stored path
    // (We use a broadcast channel or message to popup — but simplest
    //  is to fetch the raw content using the stored path in the event)
    // Actually we'll try to get from Chrome storage via message
    return dtText || '';
  }

  // ── Global drag listeners ─────────────────────────────
  document.addEventListener('dragover', (e) => {
    const target = e.target;
    if (isDropTarget(target)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      createOverlay(target);
    }
  }, true);

  document.addEventListener('dragleave', (e) => {
    const related = e.relatedTarget;
    if (!related || !isDropTarget(related)) {
      removeOverlay();
    }
  }, true);

  document.addEventListener('drop', async (e) => {
    const target = e.target;
    if (!isDropTarget(target)) return;

    e.preventDefault();
    e.stopPropagation();
    removeOverlay();

    const content = await getDropContent(e);
    if (!content) return;

    if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
      const start = target.selectionStart || 0;
      const end   = target.selectionEnd   || 0;
      const val   = target.value;
      target.value = val.slice(0, start) + content + val.slice(end);
      target.selectionStart = target.selectionEnd = start + content.length;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (target.isContentEditable) {
      const sel = window.getSelection();
      if (sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(content);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        target.textContent += content;
      }
      target.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }

    // Brief flash to confirm drop
    flashTarget(target);
  }, true);

  function flashTarget(el) {
    const prev = el.style.outline;
    el.style.outline = '2px solid #3fb950';
    el.style.transition = 'outline 0.3s';
    setTimeout(() => {
      el.style.outline = prev;
    }, 700);
  }

})();
