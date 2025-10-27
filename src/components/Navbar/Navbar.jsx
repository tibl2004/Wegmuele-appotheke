import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faLink,
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faPeopleGroup,
  faPaperPlane,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";
import "./Navbar.scss";
import logo from "../../logo.png";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const navigate = useNavigate();

  // Loginstatus + Rollen prüfen
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserTypes(parsedUser?.userTypes || []);
      } catch (err) {
        console.error("Fehler beim Parsen von user:", err);
        setUserTypes([]);
      }
    } else {
      setUserTypes([]);
    }
  }, []);

  // Menü schließen, wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        burgerMenuActive &&
        !e.target.closest(".navbar-container") &&
        !e.target.closest(".menu-icon")
      ) {
        setBurgerMenuActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerMenuActive]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserTypes([]);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${burgerMenuActive ? "active" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo-box">
          <NavLink to="/" onClick={() => setBurgerMenuActive(false)}>
            <img src={logo} alt="Logo" className="logo" />
          </NavLink>
        </div>

        {/* Burger Icon */}
        <div
          className="menu-icon"
          onClick={() => setBurgerMenuActive(!burgerMenuActive)}
        >
          <FontAwesomeIcon icon={burgerMenuActive ? faTimes : faBars} />
        </div>

        {/* Navigation */}
        <ul className={`nav-items ${burgerMenuActive ? "open" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/events" text="Events" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/blogs" text="Blog" icon={faPencil} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/subscribe-form" text="Newsletter" icon={faPaperPlane} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/links" text="Links" icon={faLink} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/ueber-uns" text="Über Uns" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/impressum" text="Impressum" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/kontakt" text="Kontakt" icon={faLink} setBurgerMenuActive={setBurgerMenuActive} />

          {!isLoggedIn ? (
            <NavItem to="/login" text="Login" icon={faSignInAlt} setBurgerMenuActive={setBurgerMenuActive} />
          ) : (
            <>
              {userTypes.includes("vorstand") && (
                <NavItem to="/vorstand" text="Vorstand" icon={faPeopleGroup} setBurgerMenuActive={setBurgerMenuActive} />
              )}
              <NavItem to="/profil" text="Profil" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
              <li>
                <button className="nav-link logout" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

function NavItem({ to, text, icon, setBurgerMenuActive }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        onClick={() => setBurgerMenuActive(false)}
      >
        <FontAwesomeIcon icon={icon} className="icon" /> {text}
      </NavLink>
    </li>
  );
}

export default Navbar;
