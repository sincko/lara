#!/usr/bin/env node
// check-unreferenced.js — PERF-02 reference-grep asset cleanup script (D-07)
//
// The source of truth for the static/assets/ deletion list. For every file in
// static/assets/, its exact basename is grepped against the reference roots:
//   src/content, src, static/admin/config.yml, gatsby-config.js, src/util/site.json
// A file is deletable iff its basename appears in NO root file's content.
//
// Read-only by default. Pass --delete to actually unlink the deletable set.
// The summary line is ALWAYS the last line of stdout, in the exact format:
//   referenced: <N> / deletable: <M>
// (the automated gates grep this pattern off `tail -1`).

const fs = require("fs")
const path = require("path")

const ASSETS_DIR = "static/assets"
const GREP_ROOTS = [
  "src/content",
  "src",
  "static/admin/config.yml",
  "gatsby-config.js",
  "src/util/site.json",
]
const READABLE_FILE = /\.(md|js|jsx|yml|yaml|json|scss)$/

function readRootFiles(root) {
  const contents = []
  if (fs.statSync(root).isFile()) {
    contents.push(fs.readFileSync(root, "utf8"))
    return contents
  }
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) stack.push(full)
      else if (READABLE_FILE.test(entry.name)) contents.push(fs.readFileSync(full, "utf8"))
    }
  }
  return contents
}

function isReferenced(basename, rootContents) {
  return rootContents.some(content => content.includes(basename))
}

function computeDeletable() {
  const files = fs.readdirSync(ASSETS_DIR)
  const rootContents = GREP_ROOTS.map(readRootFiles).flat()
  const referenced = files.filter(f => isReferenced(f, rootContents))
  const deletable = files.filter(f => !isReferenced(f, rootContents))
  return { referenced, deletable }
}

function printSummary(referenced, deletable) {
  for (const f of deletable) console.log(f)
  console.log(`referenced: ${referenced.length} / deletable: ${deletable.length}`)
}

function main() {
  const doDelete = process.argv.includes("--delete")
  const { referenced, deletable } = computeDeletable()
  printSummary(referenced, deletable)

  if (!doDelete) return 0

  let failed = false
  for (const f of deletable) {
    try {
      fs.unlinkSync(path.join(ASSETS_DIR, f))
    } catch (err) {
      console.error(`unlink failed: ${f} — ${err.message}`)
      failed = true
    }
  }

  const after = computeDeletable()
  if (after.deletable.length > 0) {
    console.error(`post-delete scan still finds ${after.deletable.length} deletable files`)
    failed = true
  }

  return failed ? 1 : 0
}

process.exit(main())
