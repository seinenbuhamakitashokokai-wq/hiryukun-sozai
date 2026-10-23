// 素材一覧の表示と絞り込み
const CAT_LABEL = {kihon:'基本', pose:'24ポーズ', kao:'顔アップ', kokuchi:'告知・お知らせ', matsuri:'お祭り', kisetsu:'季節', logo:'ロゴ文字'};
let items = [], cat = 'all', tag = '';

// 選んだカテゴリにない形は押せないようにし、ボタンに点数を出す
function updateTags() {
  const inCat = items.filter(r => cat === 'all' || r.category === cat);
  document.querySelectorAll('.tags button').forEach(b => {
    const t = b.dataset.tag;
    if (!b.dataset.label) b.dataset.label = b.textContent;
    const n = t ? inCat.filter(r => r.tags.includes(t)).length : inCat.length;
    b.textContent = `${b.dataset.label}(${n})`;
    b.disabled = n === 0;
    if (n === 0 && tag === t) { tag = ''; }
  });
  document.querySelectorAll('.tags button').forEach(b => b.classList.toggle('on', b.dataset.tag === tag));
}

function render() {
  updateTags();
  const grid = document.getElementById('grid');
  const list = items.filter(r => (cat === 'all' || r.category === cat) && (!tag || r.tags.includes(tag)));
  document.getElementById('count').textContent = `${list.length}点`;
  grid.innerHTML = '';
  if (!list.length) { grid.innerHTML = '<p>この条件の素材は、まだありません。</p>'; return; }
  for (const r of list) {
    const card = document.createElement('article');
    card.className = 'card';
    const name = r.file.split('/').pop();
    card.innerHTML = `
      <a class="thumb" href="${r.file}" target="_blank" rel="noopener" title="大きく表示"><img loading="lazy" src="${r.thumb}" alt="${r.title}"></a>
      <div class="card-body">
        <p class="card-title">${r.title}</p>
        <p class="card-meta">${CAT_LABEL[r.category] || ''} ・ ${r.w}×${r.h}px</p>
        <div class="card-actions">
          <a class="btn small primary" href="${r.file}" download="${name}">ダウンロード</a>
          ${r.left ? `<a class="btn small" href="${r.left}" download="${r.left.split('/').pop()}">左向き</a>` : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  }
}

function setOn(sel, btn) {
  document.querySelectorAll(sel).forEach(b => b.classList.toggle('on', b === btn));
}

document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; setOn('.filters button', b); render(); }));
document.querySelectorAll('.tags button').forEach(b => b.addEventListener('click', () => { tag = b.dataset.tag; setOn('.tags button', b); render(); }));
document.querySelector('.tags button').classList.add('on');

document.getElementById('copy')?.addEventListener('click', async e => {
  const t = document.getElementById('credit').textContent;
  try { await navigator.clipboard.writeText(t); e.target.textContent = 'コピーしました'; }
  catch { const r = document.createRange(); r.selectNodeContents(document.getElementById('credit')); getSelection().removeAllRanges(); getSelection().addRange(r); e.target.textContent = '選択しました'; }
  setTimeout(() => e.target.textContent = 'コピー', 1800);
});

fetch('data/materials.json').then(r => r.json()).then(d => { items = d; render(); })
  .catch(() => { document.getElementById('grid').innerHTML = '<p>素材の一覧を読み込めませんでした。時間をおいて開き直してください。</p>'; });

// 連絡フォームのURLがまだ入っていないときは「準備中」と表示する
const form = document.getElementById('form-link');
if (form && form.getAttribute('href') === 'FORM_URL') {
  form.removeAttribute('href'); form.textContent = '連絡フォーム(準備中)'; form.classList.remove('primary'); form.style.opacity = '.6';
}
