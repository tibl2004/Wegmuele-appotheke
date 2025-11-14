import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faPhone,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.scss";
import logo from "../../logo.png";
import banner from "../../banner.png"; // <-- Dein Bild hier einfügen

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const navigate = useNavigate();

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
    <>
      <nav className={`navbar ${burgerMenuActive ? "active" : ""}`}>
        {/* Info-Bar */}
        <div className="navbar-info">
          <span>
            <FontAwesomeIcon icon={faClock} /> Mo–Fr: 08:00–18:30 | Sa: 08:00–13:00
          </span>
          <span>
            <FontAwesomeIcon icon={faPhone} />
            <a href="tel:0900989900" className="phone-link">
              Notfall: 0900 98 99 00
            </a>
          </span>

        </div>

        <div className="navbar-container">
          {/* Logo */}
          <div className="logo-box">
            <NavLink to="/" onClick={() => setBurgerMenuActive(false)}>
              <img src={logo} alt="Wegmühle-Apotheke" className="logo" />
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
            <li className="nav-item dropdown">
              <span>Angebot</span>
              <ul className="dropdown-menu">
                <NavItem to="/angebote/medikamente" text="Medikamente" />
                <NavItem to="/angebote/schulmedizin" text="Schulmedizin" />
                <NavItem to="/angebote/alternativmedizin" text="Alternativmedizin" />
                <NavItem to="/angebote/herstellung" text="Herstellung" />
                <NavItem to="/angebote/weitere-produkte" text="Weitere Produkte" />
              </ul>
            </li>

            <li className="nav-item dropdown">
              <span>Dienstleistungen</span>
              <ul className="dropdown-menu">
                <NavItem to="/dienstleistungen/pharmexpert" text="Pharmexpert" />
              </ul>
            </li>

            <NavItem to="/team" text="Team" />
            <NavItem to="/bilder" text="Bilder" />
            <NavItem to="/kontakt" text="Kontakt" />

            {!isLoggedIn ? (
              <NavItem to="/login" text="Login" icon={faSignInAlt} />
            ) : (
              <>
                {userTypes.includes("vorstand") && (
                  <NavItem to="/vorstand" text="Vorstand" />
                )}
                <NavItem to="/profil" text="Profil" />
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

      {/* Banner / Foto unter der Navbar */}
      <div className="navbar-banner">
        <img src={banner} alt="Wegmühle-Apotheke Banner" />
      </div>
    </>
  );
}

function NavItem({ to, text, icon }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
      >
        {icon && <FontAwesomeIcon icon={icon} className="icon" />} {text}
      </NavLink>
    </li>
  );
}

export default Navbar;
