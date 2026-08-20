import React from "react"
import { Link } from "gatsby"
import FooterCredits from "./footer-links"

const Footer = () => (
  <footer className="site-footer">
    <div className="container">
      <p className="credits">
        Made by &copy; <Link to="https://studiosimos.it">Studio Simos</Link>
      </p>
      <br />
      <div className="footer-links">
        <FooterCredits />
        <br />
        <Link to="/privacy">Privacy policy</Link>
      </div>
    </div>
  </footer>
)

export default Footer
