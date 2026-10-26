#!/usr/bin/env node
/* Voice check for the articles. No dependencies.
 *   node scripts/check-voice.mjs [file ...]     default: every file in src/content/articles/
 * Exit 1 on any ERROR. WARN lines are advice. INFO lines are a rhythm baseline and never fail.
 *
 * What it can and cannot do: it catches the phrases in docs/voice-rules.json and reports sentence rhythm.
 * It cannot judge whether prose is lively or academic. That is the evaluator's job (docs/VOICE.md).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rules = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/voice-rules.json'), 'utf8')).phrases
  .map((r) => ({ ...r, re: new RegExp(r.match, 'i') }));

const dir = path.join(ROOT, 'src/content/articles');
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => path.join(dir, f));

let errors = 0, warns = 0;
for (const file of files) {
  const rel = path.relative(ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let inFront = false, inCode = false;
  const prose = [];
  lines.forEach((line, i) => {
    if (i === 0 && line.trim() === '---') { inFront = true; return; }
    if (inFront) { if (line.trim() === '---') inFront = false; return; }
    if (/^```/.test(line)) { inCode = !inCode; return; }
    if (inCode || /voice-ok/.test(line)) return;
    for (const r of rules) {
      const m = line.match(r.re);
      if (!m) continue;
      if (r.level === 'error') errors++; else warns++;
      console.log(`${r.level === 'error' ? 'ERROR' : 'WARN '} ${rel}:${i + 1}  "${m[0]}"  (${r.why})`);
    }
    if (!/^\s*(#|<|\||---)/.test(line)) prose.push(line.replace(/^>\s?/, ''));
  });

  /* rhythm baseline: sentence count, mean length, share of short sentences (8 words or fewer) */
  const text = prose.join(' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');
  const sentences = text.split(/(?<=[.!?])["')\]]*\s+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 2);
  const len = sentences.map((s) => s.split(/\s+/).length);
  const mean = len.reduce((a, b) => a + b, 0) / (len.length || 1);
  const short = len.filter((n) => n <= 8).length / (len.length || 1);
  console.log(`INFO  ${rel}: ${sentences.length} sentences, mean ${mean.toFixed(1)} words, ${(short * 100).toFixed(0)}% are 8 words or fewer`);
}
console.log(`\n${files.length} file(s): ${errors} error(s), ${warns} warning(s)`);
process.exit(errors ? 1 : 0);
