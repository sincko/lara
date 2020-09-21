import { Link } from "gatsby"
import React from "react"

const Logo = props => (
  <div className="site-logo">
    <Link to="/" className="hidden-xs">
      {props.title}
    </Link>
    <Link to="/" className="visible-xs">
      <img src="" alt="Logo LaryArt" />
    </Link>
  </div>
)

export default Logo