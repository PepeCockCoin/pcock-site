
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
  const ribbon = document.getElementById('countdown');
  const KEY = 'pcock_target_iso';
  let target = localStorage.getItem(KEY);
  if (!target){ target = new Date(Date.now()+48*60*60*1000).toISOString(); localStorage.setItem(KEY, target); }
  target = new Date(target);
  const fmt = n => String(n).padStart(2,'0');
  (function tick(){
    const now = new Date();
    const ms = Math.max(0, target-now);
    const d = Math.floor(ms/86400000);
    const h = Math.floor((ms%86400000)/3600000);
    const m = Math.floor((ms%3600000)/60000);
    const s = Math.floor((ms%60000)/1000);
    ribbon.querySelector('.t').textContent = `${d>0?d+'d ':''}${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  })();
  const K='pcock_metrics';
  const out = {price: document.getElementById('price'), mc: document.getElementById('mc'), holders: document.getElementById('holders')};
  const form = {p: document.getElementById('input-price'), m: document.getElementById('input-mc'), h: document.getElementById('input-holders')};
  const saved = JSON.parse(localStorage.getItem(K)||'{}');
  function render(v){ out.price.textContent=v.price??'—'; out.mc.textContent=v.mc??'—'; out.holders.textContent=v.holders??'—'; }
  render(saved);
  document.getElementById('save-metrics').addEventListener('click',()=>{
    const v = {price: form.p.value||saved.price||'—', mc: form.m.value||saved.mc||'—', holders: form.h.value||saved.holders||'—'};
    localStorage.setItem(K, JSON.stringify(v)); render(v);
  });
});
