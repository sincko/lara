#!/usr/bin/env node
/*
 * UI polish audit — checks src/ against the "make interfaces feel better" principles.
 * Usage: node scripts/audit-ui.js   (or: yarn audit:ui)
 * Exits 0 when clean, 1 when violations are found.
 */

const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const SCSS_DIR = path.join(ROOT, "src", "assets", "scss")
const SRC_DIR = path.join(ROOT, "src")

const walk = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (/\.(scss|js|jsx)$/.test(entry.name)) acc.push(full)
  }
  return acc
}

const files = walk(SRC_DIR)
const rel = p => path.relative(ROOT, p)

const findings = []
const add = (file, line, message) =>
  findings.push({ file: rel(file), line, message })

const check = (file, content, regex, message) => {
  const re = new RegExp(regex, "g")
  let match
  while ((match = re.exec(content)) !== null) {
    const line = content.slice(0, match.index).split("\n").length
    add(file, line, message)
  }
}

for (const file of files) {
  const content = fs.readFileSync(file, "utf8")

  check(file, content, /transition:\s*all\b/, "transition: all — specify exact properties")
  check(file, content, /transition[^;]*\blinear\b/, "linear easing — use cubic-bezier(0.2, 0, 0, 1)")
  check(file, content, /will-change:\s*all\b/, "will-change: all — only transform/opacity/filter")
  check(file, content, /will-change:\s*(?!transform|opacity|filter)[a-z-]+/, "will-change on non-compositable property")
  check(file, content, /box-shadow:\s*[^;]*#[0-9a-fA-F]{3,8}\b/, "opaque box-shadow color — layer transparent shadows instead")
  check(file, content, /scale\(0\.9[0-5]?\)/, "scale below 0.96 on press — use exactly 0.96")
}

const defaults = fs.readFileSync(path.join(SCSS_DIR, "_defaults.scss"), "utf8")
if (!/-webkit-font-smoothing:\s*antialiased/.test(defaults)) {
  add("src/assets/scss/_defaults.scss", 1, "missing -webkit-font-smoothing: antialiased on body")
}
if (!/text-wrap:\s*pretty/.test(defaults)) {
  add("src/assets/scss/_defaults.scss", 1, "missing text-wrap: pretty on body")
}

const style = fs.readFileSync(path.join(SCSS_DIR, "style.scss"), "utf8")
if (!/text-wrap:\s*balance/.test(style)) {
  add("src/assets/scss/style.scss", 1, "missing text-wrap: balance on headings")
}

if (findings.length === 0) {
  console.log("UI audit: clean — no violations found.")
  process.exit(0)
}

console.log(`UI audit: ${findings.length} violation(s) found.\n`)
for (const f of findings) {
  console.log(`  ${f.file}:${f.line}  ${f.message}`)
}
process.exit(1)
