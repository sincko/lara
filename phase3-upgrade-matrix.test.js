/** @jest-environment node */
const fs = require("fs")
const path = require("path")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const pkg = JSON.parse(read("package.json"))
const gatsbyConfig = read("gatsby-config.js")
const adminConfig = read("static/admin/config.yml")
const readme = read("README.md")
const nvmrc = read(".nvmrc")
const yarnrc = read(".yarnrc")
const styleScss = read("src/assets/scss/style.scss")
const themeVars = read("src/assets/scss/_theme-variables.scss")
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

describe("UPGR-01: Gatsby 5.16.x lockstep matrix", () => {
  const matrix = {
    gatsby: "5.16.1",
    "gatsby-plugin-manifest": "5.16.0",
    "gatsby-plugin-offline": "6.16.0",
    "gatsby-plugin-react-helmet": "6.16.0",
    "gatsby-plugin-sass": "6.16.0",
    "gatsby-plugin-sharp": "5.16.0",
    "gatsby-plugin-sitemap": "6.16.0",
    "gatsby-remark-images": "7.16.0",
    "gatsby-remark-prismjs": "7.16.0",
    "gatsby-remark-responsive-iframe": "6.16.0",
    "gatsby-source-filesystem": "5.16.0",
    "gatsby-transformer-remark": "6.16.0",
    "gatsby-transformer-sharp": "5.16.0",
  }

  it("pins gatsby 5.16.1 and all 12 plugins at .16.0 with exact pins (no caret)", () => {
    for (const [name, version] of Object.entries(matrix)) {
      expect(pkg.dependencies[name]).toBe(version)
    }
  })

  it("has zero 5.15.0/6.15.0/7.15.0 gatsby-* remnants", () => {
    for (const [name, version] of Object.entries(allDeps)) {
      if (name.startsWith("gatsby")) {
        expect(version).not.toMatch(/5\.15\.0|6\.15\.0|7\.15\.0/)
      }
    }
  })

  it("has zero legacy gatsby-image and keeps gatsby-plugin-netlify-cms-paths ^1.3.0 untouched", () => {
    // D-05: gatsby-image removed after the phase-5 full migration
    expect(pkg.dependencies["gatsby-image"]).toBeUndefined()
    expect(pkg.dependencies["gatsby-plugin-netlify-cms-paths"]).toBe("^1.3.0")
  })
})

describe("UPGR-02: dart-sass swap", () => {
  it("has sass ^1.30.0 and zero node-sass", () => {
    expect(pkg.dependencies.sass).toBe("^1.30.0")
    expect(JSON.stringify(pkg)).not.toMatch(/node-sass/)
  })

  it("removed the postinstall script but kept the preinstall node-version guard", () => {
    expect(pkg.scripts.postinstall).toBeUndefined()
    expect(pkg.scripts.preinstall).toBe("node scripts/check-node-version.js")
  })

  it("keeps engine-strict in .yarnrc", () => {
    expect(yarnrc).toMatch(/engine-strict\s+true/)
  })

  it("deleted clean-node-sass-vendor.js and kept check-node-version.js", () => {
    expect(
      fs.existsSync(path.join(root, "scripts/clean-node-sass-vendor.js")),
    ).toBe(false)
    expect(fs.existsSync(path.join(root, "scripts/check-node-version.js"))).toBe(
      true,
    )
  })

  it("hoisted the Google Fonts imports to the top of style.scss and removed them from _theme-variables.scss", () => {
    const lines = styleScss.split("\n")
    expect(lines[0]).toMatch(
      /^@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Parisienne/,
    )
    expect(lines[1]).toMatch(
      /^@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Ubuntu/,
    )
    // local imports must come after the font imports
    const localImportIndex = lines.findIndex(l =>
      l.includes('@import "theme-variables"'),
    )
    expect(localImportIndex).toBeGreaterThan(1)
    // the partial must have zero @import lines
    expect(themeVars).not.toMatch(/@import/)
  })

  it("documents dart-sass and zero node-sass in README", () => {
    expect(readme).toMatch(/dart-sass/)
    expect(readme).not.toMatch(/node-sass/)
  })
})

describe("UPGR-03: Decap CMS swap", () => {
  it("has decap-cms-app 3.6.4 and gatsby-plugin-decap-cms 4.0.4", () => {
    expect(pkg.dependencies["decap-cms-app"]).toBe("3.6.4")
    expect(pkg.dependencies["gatsby-plugin-decap-cms"]).toBe("4.0.4")
  })

  it("has zero netlify-cms-app and zero gatsby-plugin-netlify-cms (paths variant kept)", () => {
    expect(pkg.dependencies["netlify-cms-app"]).toBeUndefined()
    expect(pkg.dependencies["gatsby-plugin-netlify-cms"]).toBeUndefined()
    expect(pkg.dependencies["gatsby-plugin-netlify-cms-paths"]).toBe("^1.3.0")
  })

  it("registers gatsby-plugin-decap-cms in gatsby-config.js with no netlify-cms plugin entry", () => {
    expect(gatsbyConfig).toMatch(/gatsby-plugin-decap-cms/)
    expect(gatsbyConfig).not.toMatch(/gatsby-plugin-netlify-cms(?!-paths)/)
  })

  it("configures branch: main and npx decap-server in admin config and README", () => {
    expect(adminConfig).toMatch(/branch:\s*main/)
    expect(adminConfig).toMatch(/npx decap-server/)
    expect(readme).toMatch(/npx decap-server/)
  })
})

describe("UPGR-04: matomo fully removed", () => {
  it("has zero matomo references in package.json and gatsby-config.js", () => {
    expect(JSON.stringify(pkg)).not.toMatch(/matomo/i)
    expect(gatsbyConfig).not.toMatch(/matomo/i)
  })
})

describe("UPGR-06: single sitemap plugin", () => {
  it("has zero gatsby-plugin-advanced-sitemap references", () => {
    expect(JSON.stringify(pkg)).not.toMatch(/gatsby-plugin-advanced-sitemap/)
    expect(gatsbyConfig).not.toMatch(/gatsby-plugin-advanced-sitemap/)
  })

  it("keeps gatsby-plugin-sitemap 6.16.0 as the single generator", () => {
    expect(pkg.dependencies["gatsby-plugin-sitemap"]).toBe("6.16.0")
    expect(gatsbyConfig).toMatch(/gatsby-plugin-sitemap/)
  })
})

describe("D-07: Node 24 enforcement", () => {
  it("pins .nvmrc to exactly 24", () => {
    expect(nvmrc.trim()).toBe("24")
  })

  it("sets engines.node to 24.x", () => {
    expect(pkg.engines.node).toBe("24.x")
  })

  it("has zero Node.js 20 references and documents nvm alias default 24", () => {
    expect(readme).not.toMatch(/Node\.js 20/)
    expect(readme).toMatch(/nvm alias default 24/)
  })
})
