// PublicNavbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUserPlus, faBars, faPerson, faLink, faSignIn } from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.png";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);

  return (
    <nav className={`navbar ${burgerMenuActive ? "burger-menu-active" : ""}`}>
      <div className="navbar-container">
        <div className="logo-box">
          <Link to="/" onClick={() => setBurgerMenuActive(false)}>
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>

        <div className="menu-icon" onClick={() => setBurgerMenuActive(!burgerMenuActive)}>
          <FontAwesomeIcon icon={faBars} />
        </div>

        <ul className={`nav-items ${burgerMenuActive ? "active" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/events" text="Events" icon={faPerson} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/links" text="Links" icon={faLink} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/login" text="Login" icon={faSignIn} setBurgerMenuActive={setBurgerMenuActive} />

        </ul>
      </div>
    </nav>
  );
}

function NavItem({ to, text, icon, setBurgerMenuActive }) {
  return (
    <li>
      <Link to={to} className="nav-link" onClick={() => setBurgerMenuActive(false)}>
        <FontAwesomeIcon icon={icon} className="icon" /> {text}
      </Link>
    </li>
  );
}

export default Navbar;
