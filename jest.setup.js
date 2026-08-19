import "@testing-library/jest-dom"

// node-env suites (e.g. gatsby-node.test.js) have no window — guard first
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = query => ({
    matches: false,
    media: query,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })
}
