#!/usr/bin/env node
// sloplint: static checks for the tells that make a page read as AI-made.
// No dependencies. Reads HTML, CSS, JSX/TSX, Vue, Svelte and Astro files.
//
//   node sloplint.mjs <file-or-dir>... [--json]
//   node sloplint.mjs <path> --inventory before.json   # record links, forms, handlers, headings
//   node sloplint.mjs <path> --kept before.json        # fail if a redesign dropped any of them
//
// Tiers (after Hallmark's Floor/Reflex/Finish):
//   floor  - never ships. Always fails.
//   reflex - a default a model falls into. Fails unless the file carries
//            "noslop-allow RULE-ID: reason" with a real reason.
//   finish - craft detail. Reported, never fails.
// Exit 0 = clean, 1 = floor or unexcused reflex findings (or missing inventory items), 2 = usage.
import { readFileSync, writeFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const EXT = new Set(['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro', '.mdx']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.astro', 'coverage', '.turbo', '.vercel']);

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/u;
const PURPLE = /(#(?:6366f1|4f46e5|7c3aed|8b5cf6|a855f7|9333ea|6d28d9|a78bfa|c084fc)\b|\b(?:indigo|violet|purple|fuchsia)-[3-7]00\b|rgb\(\s*(?:99,\s*102,\s*241|139,\s*92,\s*246|168,\s*85,\s*247)\s*\))/i;

// Each rule: id, tier, what, fix, test(text, ctx) -> array of line numbers (1-based) or count.
const RULES = [
  { id: 'NS-ZOOM', tier: 'floor', what: 'Viewport blocks zoom', fix: 'Drop maximum-scale=1 / user-scalable=no; never disable zoom.',
    re: /<meta[^>]+name=["']viewport["'][^>]*(maximum-scale\s*=\s*1(?:\.0)?\b|user-scalable\s*=\s*(?:no|0))/gi },
  { id: 'NS-PLACEHOLDER', tier: 'floor', what: 'Placeholder content shipped', fix: 'Write real copy and use real images.',
    re: /(lorem ipsum|via\.placeholder\.com|placehold\.co|placeholder\.com\/|\bJohn Doe\b|\bJane Doe\b|\bAcme (?:Inc|Corp)\b)/gi },
  { id: 'NS-EMOJI-UI', tier: 'floor', what: 'Emoji used as an icon in a heading, button or label', fix: 'Use an SVG icon component or plain type.',
    custom: (text) => lines(text, (l) => /<(h[1-6]|button|label|summary|dt)\b[^>]*>[^<]*/i.test(l) && EMOJI.test(l.replace(/<[^>]+>/g, ' '))) },
  { id: 'NS-FOCUS-GONE', tier: 'floor', what: 'Focus outline removed with no :focus-visible replacement', fix: 'Style :focus-visible instead of removing the outline.',
    custom: (text) => /outline\s*:\s*(none|0)\b|\boutline-none\b/.test(text) && !/focus-visible/.test(text) ? lines(text, (l) => /outline\s*:\s*(none|0)\b|\boutline-none\b/.test(l)) : [] },
  { id: 'NS-ALERT', tier: 'floor', what: 'window.alert used for feedback', fix: 'Show an inline message or toast.',
    re: /\b(?:window\.)?alert\s*\(/g },

  { id: 'NS-PURPLE-GRADIENT', tier: 'reflex', what: 'Purple or indigo gradient', fix: 'One neutral base plus one accent; spend gradients only on a material reason.',
    custom: (text) => lines(text, (l) => /(linear|radial|conic)-gradient|\bbg-gradient-to-|\bfrom-\w+-\d00\b/.test(l) && PURPLE.test(l)) },
  { id: 'NS-GRADIENT-TEXT', tier: 'reflex', what: 'Gradient text (background-clip: text)', fix: 'Solid colour type; let weight and size carry emphasis.',
    re: /(background-clip\s*:\s*text|\bbg-clip-text\b)/g },
  { id: 'NS-INTER-ONLY', tier: 'reflex', what: 'Inter or Space Grotesk as the only typeface', fix: 'Pick a stack for this product and locale; give headings and body distinct roles.',
    custom: (text, ctx) => ctx.fonts.size === 1 && /^(inter|space grotesk)$/.test([...ctx.fonts][0]) ? lines(text, (l) => /font-family[^;]*\b(Inter|Space Grotesk)\b|family=(Inter|Space\+Grotesk)/i.test(l)).slice(0, 1) : [] },
  { id: 'NS-BUZZWORD', tier: 'reflex', what: 'Generated marketing verbs', fix: 'Say what the product does for whom, with a concrete verb.',
    re: /\b(elevate|seamless(?:ly)?|unleash|supercharge|revolutioni[sz]e|game[- ]changer|cutting[- ]edge|next[- ]gen(?:eration)?|empower(?:s|ing)? (?:you|teams)|transform (?:the way|your))\b/gi },
  { id: 'NS-VANITY-METRIC', tier: 'reflex', what: 'Round vanity metric', fix: 'Use a real, specific number with its source, or cut it.',
    re: /(\b\d{1,3}(?:,000)\+|\b(?:10|50|100)k\+|\b99\.9+%|\b500\+ (?:companies|teams|customers)|trusted by (?:thousands|millions|teams))/gi },
  { id: 'NS-APHORISM', tier: 'reflex', what: 'Theatrical contrast heading ("Not X. Y." / "Stop X. Start Y.")', fix: 'Name the specific benefit plainly.',
    re: /(>\s*Not (?:just )?an? [^.<]{2,30}\.\s+An? [^.<]{2,30}\.|>\s*Stop [^.<]{2,30}\.\s+Start [^.<]{2,30}\.|>\s*Less [a-z]+\.\s+More [a-z]+\.)/gi },
  { id: 'NS-DEFAULT-BLUE', tier: 'reflex', what: 'Framework default blue/indigo as the primary colour', fix: 'Choose an accent from the product, not the framework palette.',
    re: /\bbg-(?:blue|indigo)-(?:500|600)\b/g, min: 2 },
  { id: 'NS-ICON-TILE', tier: 'reflex', what: 'Rounded icon tile above every card heading', fix: 'Inline the icon with the heading, use it as a marker, or drop it.',
    re: /\b(?:h|size)-(?:10|11|12|14)\b[^"'>]*\brounded-(?:lg|xl|2xl)\b[^"'>]*\bbg-[a-z]+-(?:50|100)\b|\brounded-(?:lg|xl|2xl)\b[^"'>]*\bbg-[a-z]+-(?:50|100)\b[^"'>]*\b(?:h|size)-(?:10|11|12|14)\b/g, min: 3 },
  { id: 'NS-EYEBROW', tier: 'reflex', what: 'Tracked uppercase eyebrow labels everywhere', fix: 'Keep at most one or two; let headings stand on their own.',
    re: /\buppercase\b[^"'>]*\btracking-(?:wide|wider|widest|\[)|\btracking-(?:wide|wider|widest)\b[^"'>]*\buppercase\b|text-transform\s*:\s*uppercase[^}]*letter-spacing\s*:\s*0?\.[1-9]/g, min: 4 },
  { id: 'NS-BORDER-SHADOW', tier: 'reflex', what: 'Hairline border plus soft shadow on the same element', fix: 'Pick one: an edge for boundary or a shadow for elevation.',
    re: /class(?:Name)?=["'][^"']*\bborder\b[^"']*\bshadow(?:-sm|-md|-lg|-xl)?\b[^"']*["']|class(?:Name)?=["'][^"']*\bshadow(?:-sm|-md|-lg|-xl)?\b[^"']*\bborder\b[^"']*["']/g, min: 3 },
  { id: 'NS-GLOW', tier: 'reflex', what: 'Coloured glow shadow', fix: 'Tint shadows to the background hue, keep them tight.',
    re: /box-shadow\s*:[^;]*0\s+0\s+(?:[2-9]\d|\d{3})px[^;]*rgba?\(\s*(?!0\s*,\s*0\s*,\s*0)/gi },
  { id: 'NS-SCROLL-CUE', tier: 'reflex', what: 'Scroll cue', fix: 'Let the first screen show there is more.',
    re: /(scroll to (?:explore|discover|learn more)|↓\s*scroll|scroll\s*↓)/gi },
  { id: 'NS-PURE-BLACK', tier: 'reflex', what: 'Pure #000 text or background', fix: 'Use an off-black tuned to the palette.',
    re: /(?:background(?:-color)?|color)\s*:\s*#000(?:000)?\b|\bbg-black\b/gi, min: 2 },

  { id: 'NS-TEXT-WRAP', tier: 'finish', what: 'Headings without text-wrap: balance', fix: 'Add text-wrap: balance (or text-balance) to headings.',
    custom: (text, ctx) => ctx.isMarkupOrStyle && /<h[1-3]\b|\bh[1-3]\s*[,{]/.test(text) && !/text-wrap\s*:\s*(balance|pretty)|\btext-(balance|pretty)\b/.test(ctx.all) ? [1] : [] },
  { id: 'NS-TRANSITION-ALL', tier: 'finish', what: 'transition: all', fix: 'Transition only the properties that change (transform, opacity).',
    re: /transition\s*:\s*all\b|\btransition-all\b/g },
  { id: 'NS-100VH', tier: 'finish', what: 'height: 100vh', fix: 'Use min-height: 100dvh so mobile toolbars do not crop it.',
    re: /\bheight\s*:\s*100vh\b|\bh-screen\b/g },
  { id: 'NS-EM-DASH', tier: 'finish', what: 'Many em dashes in visible copy', fix: 'Use commas, periods or a plain hyphen.',
    custom: (text, ctx) => ctx.isMarkup ? (stripTags(text).match(/—/g) || []).length > 3 ? [1] : [] : [] },
];

function lines(text, pred) { const out = []; text.split('\n').forEach((l, i) => { if (pred(l)) out.push(i + 1); }); return out; }
function stripTags(t) { return t.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' '); }
function lineOf(text, index) { return text.slice(0, index).split('\n').length; }

function collect(paths) {
  const files = [];
  const visit = (p) => {
    if (!existsSync(p)) { console.error('sloplint: no such path ' + p); process.exit(2); }
    const st = statSync(p);
    if (st.isDirectory()) { for (const n of readdirSync(p)) if (!SKIP.has(n)) visit(join(p, n)); }
    else if (EXT.has(extname(p).toLowerCase())) files.push(p);
  };
  paths.forEach(visit);
  return files;
}

function fontsIn(all) {
  const fonts = new Set();
  for (const m of all.matchAll(/font-family\s*:\s*([^;}{"]+)/gi)) {
    const first = m[1].split(',')[0].trim().replace(/['"]/g, '').toLowerCase();
    if (first && !/^(var\(|inherit|system-ui|-apple-system|sans-serif|serif|monospace|ui-)/.test(first)) fonts.add(first);
  }
  for (const m of all.matchAll(/fonts\.googleapis\.com\/css2?\?([^"'\s>]+)/gi)) for (const f of m[1].matchAll(/family=([^:&]+)/g)) fonts.add(decodeURIComponent(f[1]).replace(/\+/g, ' ').toLowerCase());
  return fonts;
}

function lint(files) {
  const texts = files.map((f) => ({ f, text: readFileSync(f, 'utf8') }));
  const all = texts.map((t) => t.text).join('\n');
  const fonts = fontsIn(all);
  const findings = [];
  for (const { f, text } of texts) {
    const ext = extname(f).toLowerCase();
    const ctx = { all, fonts, isMarkup: !['.css', '.scss'].includes(ext), isMarkupOrStyle: true };
    const allowed = new Map();
    for (const m of text.matchAll(/noslop-allow\s+(NS-[A-Z0-9-]+)\s*:\s*([^\n*>-]{8,})/g)) allowed.set(m[1], m[2].trim());
    for (const r of RULES) {
      let at = [];
      if (r.custom) at = r.custom(text, ctx);
      else { for (const m of text.matchAll(r.re)) at.push(lineOf(text, m.index)); }
      if (r.min && at.length < r.min) continue;
      if (!at.length) continue;
      const excused = r.tier === 'reflex' && allowed.has(r.id);
      findings.push({ file: f, rule: r.id, tier: r.tier, what: r.what, fix: r.fix, lines: [...new Set(at)].slice(0, 8), count: at.length, excused: excused ? allowed.get(r.id) : null });
    }
  }
  return findings;
}

function inventory(files) {
  const inv = { links: new Set(), forms: new Set(), fields: new Set(), handlers: new Set(), headings: new Set(), ids: new Set() };
  for (const f of files) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(/\bhref=["']([^"'#][^"']*)["']/g)) inv.links.add(m[1]);
    for (const m of t.matchAll(/<form\b[^>]*?(?:action=["']([^"']*)["'])?[^>]*>/gi)) inv.forms.add(m[1] || '(no action)');
    for (const m of t.matchAll(/<(?:input|select|textarea)\b[^>]*\bname=["']([^"']+)["']/gi)) inv.fields.add(m[1]);
    for (const m of t.matchAll(/\b(on[A-Z][a-zA-Z]+)=\{([^}]{1,60})\}|@(click|submit|change|input)=["']([^"']+)["']|on:(click|submit|change|input)=\{([^}]+)\}|addEventListener\(\s*["'](\w+)["']/g)) inv.handlers.add((m[1] || m[3] || m[5] || m[7]) + ':' + (m[2] || m[4] || m[6] || '').trim());
    for (const m of t.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) { const h = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); if (h && !h.includes('{')) inv.headings.add(h); }
    for (const m of t.matchAll(/\bid=["']([^"'{}]+)["']/g)) inv.ids.add(m[1]);
  }
  return Object.fromEntries(Object.entries(inv).map(([k, v]) => [k, [...v].sort()]));
}

const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : null; };
const json = args.includes('--json'); if (json) args.splice(args.indexOf('--json'), 1);
const invOut = flag('--inventory');
const keptIn = flag('--kept');
if (!args.length || args.some((a) => a.startsWith('--'))) {
  console.error('usage: sloplint.mjs <file-or-dir>... [--json] [--inventory out.json | --kept before.json]');
  process.exit(2);
}
const files = collect(args);
if (!files.length) { console.error('sloplint: no HTML/CSS/JSX/TSX/Vue/Svelte/Astro files found'); process.exit(2); }

if (invOut) {
  writeFileSync(invOut, JSON.stringify(inventory(files), null, 2) + '\n');
  console.log('sloplint: inventory of ' + files.length + ' file(s) written to ' + invOut);
  process.exit(0);
}
if (keptIn) {
  const before = JSON.parse(readFileSync(keptIn, 'utf8'));
  const now = inventory(files);
  const missing = [];
  for (const k of Object.keys(before)) for (const v of before[k]) if (!(now[k] || []).includes(v)) missing.push(k + ': ' + v);
  if (json) console.log(JSON.stringify({ missing }, null, 2));
  else if (missing.length) { console.log('sloplint --kept: ' + missing.length + ' item(s) from before are gone:'); for (const m of missing) console.log('  - ' + m); }
  else console.log('sloplint --kept: every link, form, field, handler, heading and id from before is still there');
  process.exit(missing.length ? 1 : 0);
}

const findings = lint(files);
const failing = findings.filter((x) => x.tier === 'floor' || (x.tier === 'reflex' && !x.excused));
if (json) console.log(JSON.stringify({ files: files.length, failing: failing.length, findings }, null, 2));
else {
  const order = { floor: 0, reflex: 1, finish: 2 };
  findings.sort((a, b) => order[a.tier] - order[b.tier] || a.file.localeCompare(b.file));
  for (const x of findings) {
    const where = relative(process.cwd(), x.file) + ':' + x.lines.join(',');
    const tag = x.tier === 'reflex' && x.excused ? 'reflex (allowed: ' + x.excused + ')' : x.tier;
    console.log('[' + tag + '] ' + x.rule + '  ' + where + '\n    ' + x.what + '. ' + x.fix);
  }
  console.log((failing.length ? 'not ok' : 'ok') + ' - ' + files.length + ' file(s), ' + failing.length + ' blocking, ' + (findings.length - failing.length) + ' advisory');
}
process.exit(failing.length ? 1 : 0);
