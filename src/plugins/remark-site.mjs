// Remark plugin for the essay markdown.
//   [[Display text|key]] or [[key]]  -> <abbr> with the glossary definition
//   <!-- glossary -->                -> rendered glossary of every term used, plus frontmatter glossaryExtra
//   links to /articles/<slug>/       -> plain "coming soon" text while that article does not exist yet
//   leading "# Title"                -> removed (the layout renders the title)
//   first italic-only paragraph      -> class "dek"
//   "In a sentence:", "Argument N.", "Verdict." paragraphs get classes for styling
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const glossary = JSON.parse(fs.readFileSync(path.join(root, 'src/data/glossary.json'), 'utf8'));
const articlesDir = path.join(root, 'src/content/articles');

const articleIds = () =>
  new Set(
    fs
      .readdirSync(articlesDir)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => f.replace(/\.mdx?$/, '')),
  );

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const textOf = (node) =>
  node.type === 'text' || node.type === 'inlineCode'
    ? node.value
    : (node.children || []).map(textOf).join('');

const addClass = (node, cls) => {
  node.data = { ...(node.data || {}), hProperties: { ...((node.data || {}).hProperties || {}), className: [cls] } };
};

export default function remarkSite() {
  return (tree, file) => {
    const ids = articleIds();
    const used = new Set();
    const mark = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

    const split = (value) => {
      const out = [];
      let last = 0;
      let m;
      mark.lastIndex = 0;
      while ((m = mark.exec(value))) {
        if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
        const display = m[1].trim();
        const key = (m[2] || m[1]).trim().toLowerCase();
        const entry = glossary[key];
        if (!entry) throw new Error(`Unknown glossary key "${key}" in ${file.path}`);
        used.add(key);
        out.push({ type: 'html', value: `<abbr title="${esc(entry.definition)}">${esc(display)}</abbr>` });
        last = m.index + m[0].length;
      }
      if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
      return out;
    };

    const walk = (node) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'text' && child.value.includes('[[')) {
          const parts = split(child.value);
          node.children.splice(i, 1, ...parts);
          i += parts.length - 1;
          continue;
        }
        if (child.type === 'link' && child.url.startsWith('/articles/')) {
          const slug = child.url.split('/').filter(Boolean)[1];
          if (!ids.has(slug)) {
            const inner = child.children;
            node.children.splice(
              i,
              1,
              { type: 'html', value: '<span class="soon" title="Coming soon">' },
              ...inner,
              { type: 'html', value: '</span>' },
            );
            i += inner.length + 1;
            continue;
          }
        }
        walk(child);
      }
    };

    // title and dek
    if (tree.children[0]?.type === 'heading' && tree.children[0].depth === 1) {
      tree.children.splice(0, 1);
      const p = tree.children[0];
      if (p?.type === 'paragraph' && p.children.length === 1 && p.children[0].type === 'emphasis') addClass(p, 'dek');
    }

    // paragraph classes
    for (const node of tree.children) {
      if (node.type !== 'paragraph') continue;
      const f = node.children[0];
      if (f?.type === 'strong') {
        const t = textOf(f).trim();
        if (/^In a sentence:?$/.test(t)) addClass(node, 'in-a-sentence');
        else if (/^Argument \d/.test(t)) addClass(node, 'argument');
      } else if (f?.type === 'emphasis' && textOf(f).trim() === 'Verdict.') {
        addClass(node, 'verdict');
      }
    }

    walk(tree);

    // glossary
    const idx = tree.children.findIndex((n) => n.type === 'html' && n.value.trim() === '<!-- glossary -->');
    if (idx >= 0) {
      const fm = file.data?.astro?.frontmatter ?? {};
      for (const k of fm.glossaryExtra ?? []) {
        const key = String(k).toLowerCase();
        if (!glossary[key]) throw new Error(`Unknown glossaryExtra key "${key}" in ${file.path}`);
        used.add(key);
      }
      const items = [...used]
        .map((k) => glossary[k])
        .sort((a, b) => a.term.localeCompare(b.term))
        .map((e) => `<dt>${esc(e.term)}</dt><dd>${esc(e.definition)}</dd>`)
        .join('');
      tree.children[idx] = {
        type: 'html',
        value: `<section class="glossary" id="glossary"><h2>Glossary</h2><dl>${items}</dl></section>`,
      };
    }
  };
}
