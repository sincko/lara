import React from "react"
import { Link } from "gatsby"
import FooterCredits from "./footer-links"

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <p class="credits">
        Made with Friendship &amp; Respect for <Link to="/laryart">Lara</Link>
      </p>
      <br />
      <div class="footer-links">
        <FooterCredits /><br />
        <Link to="/privacy">Privacy policy</Link>
      </div>
    </div>
  </footer>
)

export default Footer
