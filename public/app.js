const out = document.getElementById('out');
const el = (t, props = {}, ...kids) => { const e = Object.assign(document.createElement(t), props); kids.forEach(k => e.append(k)); return e; };
const usd = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const STATUS = { claimable: 'You can claim', 'needs-team': 'Only the project team can release', uncertain: 'Check before claiming' };
const SHOW = 5; // cards shown per group before collapsing

function card(f) {
  return el('div', { className: 'card' },
    el('div', { className: 'muted', textContent: `${f.protocol} · ${f.chain} · ${f.wallet.slice(0, 6)}…${f.wallet.slice(-4)}` }),
    el('span', { className: 'tag' + (f.status === 'claimable' ? ' live' : ''), textContent: STATUS[f.status] || f.status }),
    el('div', { className: 'amt', textContent: `${f.usd == null ? '' : usd(f.usd) + '  ·  '}${Number(f.amount).toLocaleString('en-US', { maximumFractionDigits: 6 })} ${f.symbol}` }),
    el('div', { textContent: f.title }),
    el('ol', {}, ...f.steps.map(s => el('li', { textContent: s }))),
    el('a', { href: f.claimUrl, target: '_blank', rel: 'noopener noreferrer', textContent: 'Open official claim page →' }));
}

document.getElementById('f').onchange = async e => {
  const f = e.target.files[0];
  if (f && f.size < 20000) document.getElementById('w').value = await f.text();
  else out.replaceChildren(el('p', { textContent: 'File too large (max 20KB).' }));
};

document.getElementById('go').onclick = async () => {
  out.replaceChildren(el('p', { className: 'muted', textContent: 'Scanning… this can take up to 20 seconds.' }));
  try {
    const r = await fetch('/api/scan', { method: 'POST', body: JSON.stringify({ wallets: document.getElementById('w').value }) });
    const d = await r.json();
    if (!r.ok) return out.replaceChildren(el('p', { textContent: d.error }), ...(d.invalid?.length ? [el('p', { className: 'muted', textContent: `Ignored: ${d.invalid.join(', ')}` })] : []));
    const nodes = [];
    if (!d.findings.length) nodes.push(el('h2', { textContent: 'Nothing found in the sources we check' }));
    else {
      nodes.push(el('h2', { textContent: `You can claim ${usd(d.totalUsd)}` }));
      nodes.push(el('p', { className: 'muted', textContent: `${d.findings.length} position(s) found.` + (d.otherUsd ? ` Another ${usd(d.otherUsd)} needs the project team or a double-check.` : '') }));
    }
    if (d.unpriced) nodes.push(el('p', { className: 'muted', textContent: `${d.unpriced} position(s) could not be priced right now.` }));
    if (d.invalid?.length) nodes.push(el('p', { className: 'muted', textContent: `Ignored: ${d.invalid.join(', ')}` }));
    const groups = new Map();
    d.findings.forEach(f => { const k = `${f.adapter}|${f.wallet}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(f); });
    for (const list of groups.values()) {
      list.slice(0, SHOW).forEach(f => nodes.push(card(f)));
      if (list.length > SHOW) {
        const rest = list.slice(SHOW), sum = rest.reduce((s, f) => s + (f.usd || 0), 0);
        nodes.push(el('details', {}, el('summary', { textContent: `Show ${rest.length} more ${list[0].protocol} positions (${usd(sum)})` }), ...rest.map(card)));
      }
    }
    if (d.errors.length) nodes.push(el('p', { className: 'muted', textContent: `${d.errors.length} check(s) failed and may be incomplete. Try again.` }));
    nodes.push(el('p', { className: 'muted', textContent: `Sources checked: ${d.adaptersChecked.length}. Results can be incomplete; this is not financial advice.` }));
    out.replaceChildren(...nodes);
  } catch (e) { out.replaceChildren(el('p', { textContent: 'Something went wrong. Try again.' })); }
};
