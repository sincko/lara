import { Link } from "gatsby"; 
import React from "react";
import logo from '../assets/img/logo-rosa.png';
const Logo = (props) => (
  <div className="site-logo">
    {/* <Link to="/" className="hidden-xs">
      {props.title}
    </Link> */}
    <Link to="/" className="">
      <img src={logo} className="img-responsive" alt="Logo LaryArt" width="209" height="59" />
    </Link>
  </div>
);

export default Logo; 