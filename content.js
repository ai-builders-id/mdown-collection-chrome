// mdown-dropper v2 — content.js
// Handles drop events on any page using chrome.storage for content transfer

(function(){
  if(window.__mdownDropperV2) return;
  window.__mdownDropperV2 = true;

  let dropOverlay = null;

  function isDropTarget(el){
    if(!el) return false;
    const tag = el.tagName;
    if(tag==='TEXTAREA') return true;
    if(tag==='INPUT' && ['text','search','url','email'].includes(el.type)) return true;
    if(el.isContentEditable) return true;
    return false;
  }

  function createOverlay(el){
    removeOverlay();
    const rect = el.getBoundingClientRect();
    dropOverlay = document.createElement('div');
    Object.assign(dropOverlay.style, {
      position:'fixed', top:`${rect.top}px`, left:`${rect.left}px`,
      width:`${rect.width}px`, height:`${rect.height}px`,
      border:'2px dashed #58a6ff', borderRadius:'6px',
      background:'rgba(88,166,255,0.07)', pointerEvents:'none',
      zIndex:'2147483647', display:'flex', alignItems:'center', justifyContent:'center'
    });
    const label = document.createElement('div');
    Object.assign(label.style, {
      background:'rgba(13,17,23,.85)', color:'#58a6ff', borderRadius:'5px',
      padding:'3px 10px', fontSize:'12px', fontFamily:'monospace', pointerEvents:'none'
    });
    label.textContent = '📄 Drop markdown here';
    dropOverlay.appendChild(label);
    document.body.appendChild(dropOverlay);
  }

  function removeOverlay(){ if(dropOverlay){ dropOverlay.remove(); dropOverlay=null; } }

  function insertText(el, content){
    if(el.tagName==='TEXTAREA'||el.tagName==='INPUT'){
      const s=el.selectionStart||0, e=el.selectionEnd||0;
      el.value=el.value.slice(0,s)+content+el.value.slice(e);
      el.selectionStart=el.selectionEnd=s+content.length;
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    } else if(el.isContentEditable){
      const sel=window.getSelection();
      if(sel.rangeCount){
        const range=sel.getRangeAt(0);
        range.deleteContents();
        const tn=document.createTextNode(content);
        range.insertNode(tn);
        range.setStartAfter(tn); range.collapse(true);
        sel.removeAllRanges(); sel.addRange(range);
      } else { el.textContent+=content; }
      el.dispatchEvent(new InputEvent('input',{bubbles:true}));
    }
    // Flash confirmation
    const prev=el.style.outline;
    el.style.outline='2px solid #3fb950';
    setTimeout(()=>{ el.style.outline=prev; },700);
  }

  document.addEventListener('dragover', e=>{
    if(isDropTarget(e.target)){
      e.preventDefault();
      e.dataTransfer.dropEffect='copy';
      createOverlay(e.target);
    }
  }, true);

  document.addEventListener('dragleave', e=>{
    if(!e.relatedTarget||!isDropTarget(e.relatedTarget)) removeOverlay();
  }, true);

  document.addEventListener('drop', e=>{
    const target=e.target;
    if(!isDropTarget(target)) return;
    e.preventDefault(); e.stopPropagation();
    removeOverlay();

    // Check plain text first (works if content was set synchronously, e.g. from preview drag)
    const dtText = e.dataTransfer.getData('text/plain');

    if(dtText && !dtText.startsWith('{{LOADING:')){
      // Got real content directly
      insertText(target, dtText);
      return;
    }

    // Content was fetched async — retrieve from chrome.storage
    chrome.storage.local.get(['mdown_drag_content','mdown_drag_ready'], (result)=>{
      if(result.mdown_drag_ready && result.mdown_drag_content){
        insertText(target, result.mdown_drag_content);
        chrome.storage.local.remove(['mdown_drag_content','mdown_drag_ready','mdown_drag_path']);
      }
    });
  }, true);

})();
