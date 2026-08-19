/** @jest-environment node */
const fs = require("fs")
const path = require("path")
const { spawnSync } = require("child_process")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const pkg = JSON.parse(read("package.json"))
const yarnLock = read("yarn.lock")
const formikJs = read("src/components/formik.js")
const topContactsJs = read("src/components/top-contacts.js")
const styleScss = read("src/assets/scss/style.scss")
const envExample = read(".env.example")
const gitignore = read(".gitignore")

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

describe("FORM-01: MUI removed, plain SCSS form preserved", () => {
  it("removes @material-ui/core and @material-ui/icons from all four package.json fields", () => {
    expect(pkg.dependencies["@material-ui/core"]).toBeUndefined()
    expect(pkg.dependencies["@material-ui/icons"]).toBeUndefined()
    expect(pkg.devDependencies["@material-ui/core"]).toBeUndefined()
    expect(pkg.devDependencies["@material-ui/icons"]).toBeUndefined()
  })

  it("keeps yarn.lock free of any @material-ui occurrences", () => {
    expect(yarnLock).not.toMatch(/@material-ui/)
  })

  it("keeps the whole src/ tree free of @material-ui occurrences", () => {
    expect(srcText).not.toMatch(/@material-ui/)
  })

  it("renders the form with plain elements: error classes, submit button, textarea, netlify attrs, honeypot", () => {
    expect(formikJs).toContain('className={hasError ? "input error" : "input"}')
    expect(formikJs).toContain(
      'className={hasError ? "helper error" : "helper"}',
    )
    // Prettier expands the tag onto multiple lines since 04-04 added disabled — match the contract tolerantly
    expect(formikJs).toMatch(/<button\s+type="submit"\s+className="submit"/)
    expect(formikJs).toContain('as="textarea"')
    expect(formikJs).toContain('data-netlify="true"')
    expect(formikJs).toContain('name="bot-field"')
  })

  it("guards the submit button against double sends with disabled={props.isSubmitting}", () => {
    expect(formikJs).toContain("disabled={props.isSubmitting}")
  })

  it("renders top contacts with react-icons ri set at 24px and the locked hrefs", () => {
    expect(topContactsJs).toContain(
      'import { RiWhatsappLine, RiFacebookBoxLine } from "react-icons/ri"',
    )
    const fontSizeMatches =
      topContactsJs.match(/style=\{\{ fontSize: "24px" \}\}/g) || []
    expect(fontSizeMatches.length).toBeGreaterThanOrEqual(2)
    expect(topContactsJs).toContain("https://wa.me/393356785620")
    expect(topContactsJs).toContain("https://www.facebook.com/larenlarylara")
  })

  it("styles the plain form via theme variables with flattened textarea and zero MUI remnants", () => {
    expect(styleScss).toMatch(/\.input/)
    expect(styleScss).toMatch(/\.helper/)
    expect(styleScss).toMatch(/\.submit/)
    expect(styleScss).toMatch(/\.send-error/)
    expect(styleScss).toContain("var(--button-alternate-color)")
    expect(styleScss).toContain("var(--input-focus-border)")
    expect(styleScss).toContain("var(--primary-color)")
    expect(styleScss).not.toMatch(/\.textarea textarea/)
    expect(styleScss).not.toMatch(/MuiInput/)
  })
})

describe("FORM-03/UPGR-05: @emailjs/browser with env-var credentials, no hardcoded creds", () => {
  it("pins @emailjs/browser 4.4.1 and removes emailjs-com from package.json and yarn.lock", () => {
    expect(pkg.dependencies["@emailjs/browser"]).toBe("4.4.1")
    expect(pkg.devDependencies["@emailjs/browser"]).toBeUndefined()
    expect(pkg.dependencies["emailjs-com"]).toBeUndefined()
    expect(pkg.devDependencies["emailjs-com"]).toBeUndefined()
    expect(yarnLock).not.toMatch(/emailjs-com/)
  })

  it("reads EmailJS credentials exclusively from GATSBY_* env vars with a guarded v4 init", () => {
    expect(formikJs).toContain('import emailjs from "@emailjs/browser"')
    expect(formikJs).toContain("if (process.env.GATSBY_EMAILJS_PUBLIC_KEY)")
    expect(formikJs).toContain(
      "emailjs.init({ publicKey: process.env.GATSBY_EMAILJS_PUBLIC_KEY })",
    )
    expect(formikJs).toContain("process.env.GATSBY_EMAILJS_SERVICE_ID")
    expect(formikJs).toContain("process.env.GATSBY_EMAILJS_TEMPLATE_ID")
  })

  it("keeps zero hardcoded credential strings in src/", () => {
    expect(srcText).not.toMatch(/user_06xz85hi92oABMZqCIUu7/)
    expect(srcText).not.toMatch(/service_q3997uk/)
    expect(srcText).not.toMatch(/template_m6tzcmm/)
  })

  it("commits .env.example with the three GATSBY_EMAILJS_* placeholder values", () => {
    expect(fs.existsSync(path.join(root, ".env.example"))).toBe(true)
    expect(envExample).toContain(
      "GATSBY_EMAILJS_PUBLIC_KEY=user_06xz85hi92oABMZqCIUu7",
    )
    expect(envExample).toContain("GATSBY_EMAILJS_SERVICE_ID=service_q3997uk")
    expect(envExample).toContain("GATSBY_EMAILJS_TEMPLATE_ID=template_m6tzcmm")
  })

  it("keeps the .gitignore !.env.example negation rule after the .env* line", () => {
    const dotEnvLine = gitignore.indexOf(".env*")
    const negation = gitignore.indexOf("!.env.example")
    expect(dotEnvLine).toBeGreaterThan(-1)
    expect(negation).toBeGreaterThan(dotEnvLine)
  })

  it("tracks .env.example in git and does not ignore it", () => {
    const lsFiles = spawnSync("git", ["ls-files"], {
      cwd: root,
      encoding: "utf8",
    })
    expect(lsFiles.status).toBe(0)
    expect(lsFiles.stdout).toContain(".env.example")

    const checkIgnore = spawnSync("git", ["check-ignore", ".env.example"], {
      cwd: root,
      encoding: "utf8",
    })
    expect(checkIgnore.status).not.toBe(0)
  })
})
