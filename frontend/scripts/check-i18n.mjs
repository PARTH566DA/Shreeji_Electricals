// Fails (exit 1) unless every language file has exactly the same keys, list lengths
// and {{placeholders}} as en.json. Run: npm run i18n:check
import { readFileSync } from 'node:fs'

const load = (l) => JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url), 'utf8'))
const base = load('en')
const vars = (s) => [...String(s).matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort().join(',')
let problems = 0

function compare(a, b, path, lang) {
  const report = (msg) => { problems++; console.error(`  [${lang}] ${path || '(root)'}: ${msg}`) }
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return report('expected a list')
    if (a.length !== b.length) report(`list has ${b.length} items, expected ${a.length}`)
    a.forEach((v, i) => b[i] !== undefined && compare(v, b[i], `${path}[${i}]`, lang))
  } else if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object' || Array.isArray(b)) return report('expected an object')
    for (const k of Object.keys(a)) {
      if (!(k in b)) report(`missing key "${k}"`)
      else compare(a[k], b[k], path ? `${path}.${k}` : k, lang)
    }
    for (const k of Object.keys(b)) if (!(k in a)) report(`extra key "${k}" (not in en.json)`)
  } else {
    if (typeof b !== 'string' || !b.trim()) return report('empty or not a string')
    if (vars(a) !== vars(b)) report(`placeholders {${vars(b)}} differ from English {${vars(a)}}`)
  }
}

for (const lang of ['gu', 'hi']) compare(base, load(lang), '', lang)
if (problems) {
  console.error(`i18n check failed: ${problems} problem(s).`)
  process.exit(1)
}
console.log('i18n check passed: en, gu and hi are in sync.')
