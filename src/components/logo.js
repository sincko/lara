import { Link } from "gatsby"; 
import React from "react";
import logo from '../assets/img/logo-bianco2.png';
const Logo = (props) => (
  <div className="site-logo">
    {/* <Link to="/" className="hidden-xs">
      {props.title}
    </Link> */}
    <Link to="/" className="">
      <img src={logo} className="img-responsive" alt="Logo LaryArt" />
    </Link>
  </div>
);

export default Logo; 