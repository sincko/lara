/** @jest-environment jsdom */
// Behavioral test of the vendored GA4 gtag snippet (UPGR-04, owner override of Matomo).
//
// Module-scope init runs at require time and OVERWRITES window.gtag with its own
// function that pushes into window.dataLayer — so a pre-set jest.fn() would be
// clobbered. Instead: pre-seed window.dataLayer, assert the init calls from it,
// then swap window.gtag for a jest.fn() to assert onRouteUpdate's config calls.
//
// The init also does document.getElementsByTagName("script")[0].parentNode.insertBefore(...)
// — the real page always has at least one script tag (the bundle), so the fixture
// adds one to mirror the browser.

const GA_MEASUREMENT_ID = "G-JFNK4HVQCC"

const loadModule = () => {
  jest.resetModules()
  return require("./gatsby-browser")
}

describe("gatsby-browser GA4 snippet", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    document.body.innerHTML = ""
    document.body.appendChild(document.createElement("script"))
    document.title = "LaryArt"
    window.dataLayer = []
    delete window.gtag
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("exports onRouteUpdate and onServiceWorkerUpdateReady", () => {
    const mod = loadModule()
    expect(typeof mod.onRouteUpdate).toBe("function")
    expect(typeof mod.onServiceWorkerUpdateReady).toBe("function")
  })

  it("module-scope init registers gtag with anonymize_ip and send_page_view false", () => {
    loadModule()

    // init pushes ("js", Date) then ("config", ID, {...}) into dataLayer
    expect(window.dataLayer).toHaveLength(2)
    expect(window.dataLayer[0][0]).toBe("js")
    expect(window.dataLayer[0][1]).toBeInstanceOf(Date)
    expect(window.dataLayer[1][0]).toBe("config")
    expect(window.dataLayer[1][1]).toBe(GA_MEASUREMENT_ID)
    expect(window.dataLayer[1][2]).toEqual({
      anonymize_ip: true,
      send_page_view: false,
    })
  })

  it("onRouteUpdate pushes page_path and absolute page_referrer configs", () => {
    const { onRouteUpdate } = loadModule()
    window.gtag = jest.fn()

    onRouteUpdate({
      location: { pathname: "/blog", search: "?page=2", hash: "#top" },
      prevLocation: { pathname: "/", search: "", hash: "" },
    })
    jest.advanceTimersByTime(32)

    expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
      page_referrer: "http://localhost/",
    })
    expect(window.gtag).toHaveBeenCalledWith("config", GA_MEASUREMENT_ID, {
      page_path: "/blog?page=2#top",
      page_title: "LaryArt",
    })
  })

  it("onRouteUpdate omits page_referrer when there is no prevLocation", () => {
    const { onRouteUpdate } = loadModule()
    window.gtag = jest.fn()

    onRouteUpdate({
      location: { pathname: "/", search: "", hash: "" },
      prevLocation: null,
    })
    jest.advanceTimersByTime(32)

    const configCalls = window.gtag.mock.calls.filter(
      call => call[0] === "config",
    )
    expect(configCalls).toHaveLength(1)
    expect(configCalls[0][2]).not.toHaveProperty("page_referrer")
    expect(configCalls[0][2]).toMatchObject({ page_path: "/" })
  })

  it("onRouteUpdate is a no-op when window.gtag is unavailable", () => {
    const { onRouteUpdate } = loadModule()
    delete window.gtag

    expect(() =>
      onRouteUpdate({
        location: { pathname: "/", search: "", hash: "" },
        prevLocation: null,
      }),
    ).not.toThrow()
    jest.advanceTimersByTime(32)
  })

  // jsdom's window.location.reload is read-only — replace the whole location
  // object (same pattern as formik.test.js's assign stub)
  const stubReload = () => {
    delete window.location
    Object.defineProperty(window, "location", {
      value: { reload: jest.fn() },
      writable: true,
    })
    return window.location.reload
  }

  it("onServiceWorkerUpdateReady reloads the page when the user confirms", () => {
    const { onServiceWorkerUpdateReady } = loadModule()
    window.confirm = jest.fn(() => true)
    const reload = stubReload()

    onServiceWorkerUpdateReady()

    expect(window.confirm).toHaveBeenCalled()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it("onServiceWorkerUpdateReady does not reload when the user declines", () => {
    const { onServiceWorkerUpdateReady } = loadModule()
    window.confirm = jest.fn(() => false)
    const reload = stubReload()

    onServiceWorkerUpdateReady()

    expect(window.confirm).toHaveBeenCalled()
    expect(reload).not.toHaveBeenCalled()
  })
})
