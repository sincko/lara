import { Link } from "gatsby"
import React from "react"

const Logo = props => (
  <div className="site-logo">
    <Link to="/" className="hidden-xs">
      {props.title}
    </Link>
    <Link to="/" className="visible-xs">
      
      <img src="" />
    </Link>
  </div>
)

export default Logo