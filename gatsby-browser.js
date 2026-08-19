const MATOMO_URL = "https://matomo.duckdns.org"
const MATOMO_SITE_ID = "4"

// Module scope runs once per page load — guard for SSR/build (no window in Node)
if (typeof window !== "undefined") {
  window._paq = window._paq || []
  window._paq.push(["disableCookies"]) // cookie-less tracking (D-12)
  window._paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`])
  window._paq.push(["setSiteId", MATOMO_SITE_ID])
  window._paq.push(["enableHeartBeatTimer"])

  const d = document
  const g = d.createElement("script")
  const s = d.getElementsByTagName("script")[0]
  g.type = "text/javascript"
  g.async = true
  g.defer = true
  g.src = `${MATOMO_URL}/matomo.js`
  s.parentNode.insertBefore(g, s)
}

export const onRouteUpdate = ({ location, prevLocation }) => {
  if (typeof window === "undefined" || !window._paq) return
  const url = location.pathname + location.search + location.hash
  const prevUrl = prevLocation
    ? prevLocation.pathname + prevLocation.search + prevLocation.hash
    : null
  // document.title workaround (react-helmet updates title after route change)
  setTimeout(() => {
    if (prevUrl) window._paq.push(["setReferrerUrl", prevUrl])
    window._paq.push(["setCustomUrl", url])
    window._paq.push(["setDocumentTitle", document.title])
    window._paq.push(["trackPageView"])
    window._paq.push(["enableLinkTracking"])
  }, 32)
}

export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`,
  )

  if (answer === true) {
    window.location.reload()
  }
}
