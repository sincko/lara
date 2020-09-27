import React from "react"
import { Link } from "gatsby"
import {RiArrowLeftSLine, RiBugLine, RiSkullLine} from "react-icons/ri"

import SEO from "../components/seo"
import Layout from "../components/layout"

const NotFound = () => (
  <Layout className="not-found-page">
    <SEO title="Page not found"/>
    <div className="wrapper" style={{
      textAlign: "center"
    }}>
      <header>
        <RiSkullLine style={{
          fontSize: "128px",
          color: "var(--primary-color)"
        }}/>
        <h1>Oops non mi aspettavo che capitasse ;)</h1>
        <p>Sei finita/o in una parte del sito dove non c'è niente.</p>
      </header>
      <Link to="/" className="button"><RiArrowLeftSLine className="icon -left"/>Ritorna in Homepage</Link>
      <Link to="/contatti" className="button -outline">Contattami per farmelo sapere <RiBugLine className="icon -right"/></Link>
    </div>
  </Layout>
)

export default NotFound