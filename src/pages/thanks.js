import React from "react"
import { Link } from "gatsby"
import { RiArrowLeftSLine, RiCheckboxCircleLine } from "react-icons/ri"

import Seo from "../components/seo"
import Layout from "../components/layout"

const Thanks = () => (
  <Layout className="thanks-page">
    <Seo title="Grazie" />
    <div
      className="wrapper"
      style={{
        textAlign: "center",
      }}
    >
      <RiCheckboxCircleLine
        style={{
          fontSize: "128px",
          color: "var(--primary-color)",
        }}
      />
      <h1>Ho ricevuto il tuo messaggio</h1>
      <p>Grazie per avermi contattato. Ti risponderò a breve.</p>
      <Link to="/" className="button">
        <RiArrowLeftSLine className="icon -left" />
        Ritorna in Home Page
      </Link>
    </div>
  </Layout>
)

export default Thanks
