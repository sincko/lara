import React from "react"
import { RiWhatsappLine, RiFacebookBoxLine } from "react-icons/ri"
const TopContacts = () => {
  return (
    <div className="icons-top">
      <a href="https://wa.me/393356785620" target="_blank" rel="noopener noreferrer">
        <RiWhatsappLine style={{ fontSize: "24px" }} />
      </a>
      <a href="https://www.facebook.com/larenlarylara" target="_blank" rel="noopener noreferrer">
        <RiFacebookBoxLine style={{ fontSize: "24px" }} />
      </a>
    </div>
  )
}

export default TopContacts
