/** @jest-environment node */
const fs = require("fs")
const path = require("path")

const root = __dirname
const read = rel => fs.readFileSync(path.join(root, rel), "utf8")

const pkg = JSON.parse(read("package.json"))
const jestConfig = read("jest.config.js")
const jestPreprocess = read("jest-preprocess.js")
const jestSetup = read("jest.setup.js")
const loadershim = read("loadershim.js")
const gatsbyMock = read("__mocks__/gatsby.js")
const fileMock = read("__mocks__/file-mock.js")
const formikTest = read("src/components/formik.test.js")
const blogListTest = read("src/templates/blog-list.test.js")
const navigationTest = read("src/components/navigation.test.js")
const gatsbyNodeTest = read("gatsby-node.test.js")

describe("FNDT-05: jest scaffold integrity", () => {
  it("package.json test script is exactly 'jest --watch=false'", () => {
    expect(pkg.scripts.test).toBe("jest --watch=false")
  })

  it("pins the 8 scaffold devDependencies at their exact versions", () => {
    const expected = {
      jest: "29.7.0",
      "babel-jest": "29.7.0",
      "jest-environment-jsdom": "29.7.0",
      "@testing-library/react": "16.3.2",
      "@testing-library/jest-dom": "6.6.3",
      "@testing-library/dom": "^10.0.0",
      "identity-obj-proxy": "3.0.0",
      "babel-preset-gatsby": "3.16.0",
    }
    for (const [name, version] of Object.entries(expected)) {
      expect(pkg.devDependencies[name]).toBe(version)
    }
  })

  it("jest.config.js wires transform, moduleNameMapper, ignores, and setup files", () => {
    expect(jestConfig).toContain('"^.+\\\\.jsx?$"')
    expect(jestConfig).toContain("identity-obj-proxy")
    expect(jestConfig).toContain("<rootDir>/__mocks__/file-mock.js")
    expect(jestConfig).toContain('"^@reach/router$"')
    expect(jestConfig).toContain("@gatsbyjs/reach-router")
    expect(jestConfig).toContain(
      "node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)",
    )
    expect(jestConfig).toContain("<rootDir>/loadershim.js")
    expect(jestConfig).toContain("<rootDir>/jest.setup.js")
  })

  it("jest-preprocess.js transforms through babel-preset-gatsby", () => {
    expect(jestPreprocess).toContain("babel-preset-gatsby")
  })

  it("loadershim.js sets the gatsby loader global", () => {
    expect(loadershim).toContain("global.___loader")
  })

  it("jest.setup.js imports jest-dom and guards matchMedia for node envs", () => {
    expect(jestSetup).toContain('import "@testing-library/jest-dom"')
    expect(jestSetup).toContain("typeof window")
  })

  it("__mocks__/gatsby.js mocks Link (renders <a href={to}>), graphql, useStaticQuery", () => {
    expect(gatsbyMock).toContain("href: to")
    expect(gatsbyMock).toContain("graphql: jest.fn()")
    expect(gatsbyMock).toContain("useStaticQuery: jest.fn()")
  })

  it("__mocks__/file-mock.js exports the test-file-stub", () => {
    expect(fileMock).toContain("test-file-stub")
  })
})

describe("FNDT-05: regression suites guard their own contracts", () => {
  it("formik.test.js mocks @emailjs/browser before importing FormikContact and never leaks the key", () => {
    const mockIndex = formikTest.indexOf('jest.mock("@emailjs/browser"')
    const importIndex = formikTest.indexOf("import FormikContact")
    expect(mockIndex).toBeGreaterThan(-1)
    expect(importIndex).toBeGreaterThan(-1)
    expect(mockIndex).toBeLessThan(importIndex)
    expect(formikTest).not.toMatch(/user_/)
  })

  it("formik.test.js keeps a passing (non-skipped) validation test", () => {
    expect(formikTest).toMatch(/it\("surfaces yup validation errors/)
    expect(formikTest).toContain('toHaveClass("error")')
  })

  it("blog-list.test.js declares all 4 mocks before the BlogIndex import", () => {
    const importIndex = blogListTest.indexOf("import BlogIndex")
    const mocks = [
      'jest.mock("../components/post-card"',
      'jest.mock("@reach/router"',
      'jest.mock("../components/layout"',
      'jest.mock("../components/seo"',
    ]
    for (const mock of mocks) {
      const idx = blogListTest.indexOf(mock)
      expect(idx).toBeGreaterThan(-1)
      expect(idx).toBeLessThan(importIndex)
    }
  })

  it("blog-list.test.js asserts the literal pagination hrefs /blog/2 and /blog/", () => {
    expect(blogListTest).toContain('"/blog/2"')
    expect(blogListTest).toContain('"/blog/"')
  })

  it("navigation.test.js asserts the menu-trigger is-active class flip", () => {
    expect(navigationTest).toContain('toContain("is-active")')
    expect(navigationTest).toContain('not.toContain("is-active")')
  })

  it("gatsby-node.test.js runs in node env, requires ./gatsby-node, and asserts panicOnBuild + /blog paths", () => {
    expect(gatsbyNodeTest.startsWith("/** @jest-environment node */")).toBe(
      true,
    )
    expect(gatsbyNodeTest).toContain('require("./gatsby-node")')
    expect(gatsbyNodeTest).not.toContain('require("../gatsby-node")')
    expect(gatsbyNodeTest).toContain("panicOnBuild")
    expect(gatsbyNodeTest).toContain('toContain("/blog")')
    expect(gatsbyNodeTest).toContain('toContain("/blog/2")')
  })
})
