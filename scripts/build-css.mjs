/**
 * Rebuild css/app.css from the ordered modular stylesheets.
 * This is an optional local build helper; the published app remains static
 * HTML/CSS/Vanilla JS and does not require Node.js at runtime.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sources = [
  'reset.css', 'variables.css', 'typography.css', 'layout.css',
  'components.css', 'dashboard.css', 'calendar.css', 'schedule.css',
  'responsive.css', 'print.css', 'theme-i18n.css', 'ui-scale.css'
];
const chunks = await Promise.all(sources.map(async name =>
  `/* ===== ${name} ===== */\n${await readFile(resolve(root, 'css', name), 'utf8')}`
));
await writeFile(resolve(root, 'css', 'app.css'), chunks.join('\n\n'));
console.log(`Built css/app.css from ${sources.length} source stylesheets.`);
