import React from "react"
import { Link } from "gatsby"
import FooterCredits from "./footer-links"

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <p class="credits">
        Made with Friendship &amp; Respect for <Link to="/laryart">Lara</Link> |{" "}
        <Link to="/privacy">Privacy Policy</Link>
      </p>
      <br />
      <div class="footer-links">
        <FooterCredits />
      </div>
    </div>
  </footer>
)

export default Footer
