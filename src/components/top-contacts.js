import React from "react"
import FacebookIcon from "@material-ui/icons/Facebook"
import WhatsAppIcon from "@material-ui/icons/WhatsApp"
const TopContacts = () => {
  return (
    <div className="icons-top">
      <a href="https://wa.me/393356785620" target="_blank" rel="noopener noreferrer">
        <WhatsAppIcon />
      </a>
      <a href="https://www.facebook.com/larenlarylara" target="_blank" rel="noopener noreferrer">
        <FacebookIcon />
      </a>
    </div>
  )
}

export default TopContacts
