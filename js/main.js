
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

  // Floating emojis
  const floating = document.querySelector('.floating');
  const emojis = ['🐓','🐸','🔥','📈','💰','🧪'];
  for (let i=0;i<24;i++){
    const s = document.createElement('span');
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    s.style.left = Math.random()*100+'%';
    s.style.animationDelay = (Math.random()*12)+'s';
    s.style.fontSize = (14+Math.random()*24)+'px';
    floating.appendChild(s);
  }

  // WebAudio
  let ctx;
  const ensureCtx = () => { if (!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)(); return ctx; }
  const buyBtn = document.getElementById('buy');
  if (buyBtn){
    buyBtn.addEventListener('mouseenter', () => {
      const a = ensureCtx();
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = 'sine'; osc.frequency.value = 60;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(a.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.08, a.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime+0.25);
      setTimeout(()=>{ try{osc.stop()}catch(e){} }, 300);
    });
  }
  let clucked = false;
  window.addEventListener('scroll', () => {
    if (clucked) return; clucked = true;
    const a = ensureCtx();
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, a.currentTime+0.18);
    gain.gain.value = 0.0001;
    gain.gain.exponentialRampToValueAtTime(0.06, a.currentTime+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime+0.25);
    osc.connect(gain).connect(a.destination);
    osc.start();
    setTimeout(()=>{ try{osc.stop()}catch(e){} }, 300);
  }, {passive:true});

  // COUNTDOWN
  const ribbon = document.getElementById('countdown');
  const targetIso = ribbon?.dataset?.target || null;
  let target;
  if (targetIso){
    target = new Date(targetIso);
  } else {
    // default: 48h from first visit (persist in localStorage)
    const KEY = 'pcock_target_iso';
    const saved = localStorage.getItem(KEY);
    if (saved) target = new Date(saved);
    else {
      target = new Date(Date.now() + 48*60*60*1000);
      localStorage.setItem(KEY, target.toISOString());
    }
  }
  function fmt(n){ return String(n).padStart(2,'0') }
  function tick(){
    const now = new Date();
    const ms = Math.max(0, target - now);
    const d = Math.floor(ms/86400000);
    const h = Math.floor((ms%86400000)/3600000);
    const m = Math.floor((ms%3600000)/60000);
    const s = Math.floor((ms%60000)/1000);
    if (ribbon){
      ribbon.querySelector('.t').textContent = `${d>0?d+'d ':''}${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    }
    requestAnimationFrame(tick);
  }
  if (ribbon) tick();

  // PRICE PANEL
  const priceEl = document.getElementById('price');
  const mcEl = document.getElementById('mc');
  const holdersEl = document.getElementById('holders');
  const inputPrice = document.getElementById('input-price');
  const inputMc = document.getElementById('input-mc');
  const inputHolders = document.getElementById('input-holders');
  const saveBtn = document.getElementById('save-metrics');
  const urlInput = document.getElementById('price-url');
  const fetchBtn = document.getElementById('fetch-now');

  const K='pcock_metrics';
  const saved = JSON.parse(localStorage.getItem(K) || '{}');
  function render(m){
    priceEl.textContent = m.price ?? '—';
    mcEl.textContent = m.mc ?? '—';
    holdersEl.textContent = m.holders ?? '—';
  }
  render(saved);

  if (saveBtn){
    saveBtn.addEventListener('click', () => {
      const m = {
        price: inputPrice.value || saved.price || '—',
        mc: inputMc.value || saved.mc || '—',
        holders: inputHolders.value || saved.holders || '—',
      };
      localStorage.setItem(K, JSON.stringify(m));
      render(m);
    });
  }

  async function tryFetch(){
    const u = urlInput.value.trim();
    if (!u) return;
    try{
      const r = await fetch(u, {mode:'cors'});
      const j = await r.json();
      // naive mapping: try common paths, else show top-level keys to console
      let price = null, mc = null, holders = null;
      // attempt known fields
      price = j.price ?? j.data?.priceUsd ?? j.data?.price ?? j.data?.attributes?.priceUsd ?? null;
      mc = j.marketCap ?? j.data?.marketCapUsd ?? j.data?.marketCap ?? j.data?.attributes?.fdv ?? null;
      holders = j.holders ?? j.data?.holders ?? j.data?.attributes?.holderCount ?? null;
      const m = {
        price: price!=null ? String(price) : saved.price ?? '—',
        mc: mc!=null ? String(mc) : saved.mc ?? '—',
        holders: holders!=null ? String(holders) : saved.holders ?? '—',
      };
      localStorage.setItem(K, JSON.stringify(m));
      render(m);
    }catch(e){
      console.warn('Fetch failed', e);
      alert('Auto-fetch failed (CORS or bad URL). You can paste price/MC manually and Save.');
    }
  }
  if (fetchBtn){ fetchBtn.addEventListener('click', tryFetch); }
});
