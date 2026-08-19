const GA_MEASUREMENT_ID = "G-JFNK4HVQCC"

// Module scope runs once per page load — guard for SSR/build (no window in Node)
if (typeof window !== "undefined") {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag("js", new Date())
  // send_page_view: false — onRouteUpdate owns every pageview (it fires on the
  // initial mount too, so a module-scope pageview would double-count the first page)
  window.gtag("config", GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: false,
  })

  const d = document
  const g = d.createElement("script")
  const s = d.getElementsByTagName("script")[0]
  g.type = "text/javascript"
  g.async = true
  g.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  s.parentNode.insertBefore(g, s)
}

export const onRouteUpdate = ({ location, prevLocation }) => {
  if (typeof window === "undefined" || !window.gtag) return
  const url = location.pathname + location.search + location.hash
  const prevUrl = prevLocation
    ? window.location.origin +
      prevLocation.pathname +
      prevLocation.search +
      prevLocation.hash
    : null
  // document.title workaround (react-helmet updates title after route change)
  setTimeout(() => {
    if (prevUrl) {
      window.gtag("config", GA_MEASUREMENT_ID, { page_referrer: prevUrl })
    }
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
    })
  }, 32)
}

export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  )

  if (answer === true) {
    window.location.reload()
  }
}
