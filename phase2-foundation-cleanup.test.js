/** @jest-environment node */
const fs = require("fs")
const path = require("path")
const { spawnSync } = require("child_process")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const pkg = JSON.parse(read("package.json"))
const netlifyToml = read("netlify.toml")
const prettierIgnore = read(".prettierignore")
const nvmrc = read(".nvmrc")
const siteJson = read("src/util/site.json")
const readme = read("README.md")

const walkFiles = dir => {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkFiles(full))
    else out.push(full)
  }
  return out
}

const srcText = walkFiles(path.join(root, "src"))
  .map(f => fs.readFileSync(f, "utf8"))
  .join("\n")

const hasGaKey = obj => {
  if (obj && typeof obj === "object") {
    for (const key of Object.keys(obj)) {
      if (key === "ga") return true
      if (hasGaKey(obj[key])) return true
    }
  }
  return false
}

describe("FNDT-01: single-lockfile yarn-only build path", () => {
  it("keeps package-lock.json off the filesystem and out of git, with yarn.lock the only tracked lockfile", () => {
    expect(fs.existsSync(path.join(root, "package-lock.json"))).toBe(false)

    const lsFiles = spawnSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    })
    expect(lsFiles.status).toBe(0)
    expect(lsFiles.stdout).toContain("yarn.lock")
    expect(lsFiles.stdout).not.toContain("package-lock.json")
    expect(lsFiles.stdout).not.toContain("npm-shrinkwrap.json")
  })

  it("builds on Netlify with yarn build and never npm run build", () => {
    expect(netlifyToml).toMatch(/command\s*=\s*"yarn build"/)
    expect(netlifyToml).not.toContain("npm run build")
  })

  it("keeps .prettierignore at exactly the three intended lines with no package-lock.json entry", () => {
    const lines = prettierIgnore
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0)
    expect(lines).toEqual([".cache", "package.json", "public"])
    expect(prettierIgnore).not.toContain("package-lock.json")
  })

  it("has no yarn or y18n dependency entries while keeping the packageManager field", () => {
    expect(pkg.dependencies.yarn).toBeUndefined()
    expect(pkg.dependencies.y18n).toBeUndefined()
    expect(pkg.devDependencies.yarn).toBeUndefined()
    expect(pkg.devDependencies.y18n).toBeUndefined()
    expect(pkg.packageManager).toBe("yarn@1.22.22")
  })

  it("keeps the research-proven keepers prismjs and @testing-library/dom", () => {
    expect(pkg.dependencies.prismjs).toBeDefined()
    expect(pkg.devDependencies["@testing-library/dom"]).toBeDefined()
  })
})

describe("FNDT-02: .nvmrc is the single Node version source", () => {
  it("has no NODE_VERSION or build.environment section in netlify.toml", () => {
    expect(netlifyToml).not.toMatch(/NODE_VERSION/)
    expect(netlifyToml).not.toMatch(/\[build\.environment\]/)
  })

  it("keeps .nvmrc as a single-line valid Node major", () => {
    expect(fs.existsSync(path.join(root, ".nvmrc"))).toBe(true)
    expect(nvmrc).toMatch(/^(20|24)\s*$/)
  })
})

describe("FNDT-03: dead form components removed", () => {
  it("deletes old-form.js and form-pulito.js from the filesystem", () => {
    expect(fs.existsSync(path.join(root, "src/components/old-form.js"))).toBe(
      false,
    )
    expect(
      fs.existsSync(path.join(root, "src/components/form-pulito.js")),
    ).toBe(false)
  })

  it("leaves zero references to old-form or form-pulito in src/ and gatsby config files", () => {
    const configText = [
      read("gatsby-config.js"),
      read("gatsby-node.js"),
      read("gatsby-browser.js"),
    ].join("\n")
    expect(srcText).not.toMatch(/old-form|form-pulito/)
    expect(configText).not.toMatch(/old-form|form-pulito/)
  })
})

describe("FNDT-04: unused runtime dependencies removed", () => {
  it("has zero codemirror, seamless-immutable, gatsby-background-image, package-doctor entries", () => {
    for (const name of [
      "codemirror",
      "seamless-immutable",
      "gatsby-background-image",
      "package-doctor",
    ]) {
      expect(pkg.dependencies[name]).toBeUndefined()
      expect(pkg.devDependencies[name]).toBeUndefined()
    }
  })
})

describe("FNDT-04: unused devDependencies removed", () => {
  it("has zero redux, react-refresh, typescript, acorn, netlify-cms-lib-widgets entries", () => {
    for (const name of [
      "redux",
      "react-refresh",
      "typescript",
      "acorn",
      "netlify-cms-lib-widgets",
    ]) {
      expect(pkg.dependencies[name]).toBeUndefined()
      expect(pkg.devDependencies[name]).toBeUndefined()
    }
  })
})

describe("SEOS-04: site.json carries no dead ga placeholder", () => {
  it("parses as valid JSON with no ga key anywhere", () => {
    const site = JSON.parse(siteJson)
    expect(site.ga).toBeUndefined()
    expect(hasGaKey(site)).toBe(false)
  })

  it("keeps the meta object intact with siteUrl https://laryart.it and a LaryArt title", () => {
    const site = JSON.parse(siteJson)
    expect(site.meta.siteUrl).toBe("https://laryart.it")
    expect(site.meta.title).toContain("LaryArt")
  })
})

describe("SEOS-04: README describes laryart.it without starter boilerplate", () => {
  it("has zero starter boilerplate tokens", () => {
    const forbidden = [
      /stackrole/i,
      /gatsby-starter-foundation/i,
      /Deploy to Netlify/i,
      /twitter-header/i,
      /screenshot\.png/i,
      /package-lock\.json/i,
      /UA-/,
      /pensive-engelbart/i,
    ]
    for (const token of forbidden) {
      expect(readme).not.toMatch(token)
    }
  })

  it("documents the yarn workflow and laryart.it with zero npm commands", () => {
    expect(readme).toContain("yarn install")
    expect(readme).toContain("yarn develop")
    expect(readme).toContain("yarn build")
    expect(readme).toContain("laryart.it")
    expect(readme).not.toMatch(/npm install/)
    expect(readme).not.toMatch(/npm run build/)
  })
})
