import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Header from "./header"
import Logo from "./logo"
import Navigation from "./navigation"

// PERF-01: self-hosted font (was: Google Fonts CSS import in style.scss)
import "@fontsource/ubuntu/400.css"
// PERF-01: self-hosted font (was: Google Fonts CSS import in style.scss)
import "@fontsource/ubuntu/700.css"
// PERF-01: self-hosted font (was: Google Fonts CSS import in style.scss)
import "@fontsource/parisienne/400.css"
import "../assets/scss/style.scss"
import Footer from "./footer"
import TopContacts from "./top-contacts"

const query = graphql`
  query LayoutQuery {
    site {
      siteMetadata {
        siteTitle: title
      }
    }
  }
`

const Layout = ({ children, className }) => {
  const { site } = useStaticQuery(query)
  const { siteTitle } = site.siteMetadata

  return (
    <div className="primary-container">
      <Header>
        <Logo title={siteTitle} />
        <div className="cont-nav">
          <TopContacts />
          <Navigation />
        </div>
      </Header>
      <main className={"container " + className + " main"}>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
