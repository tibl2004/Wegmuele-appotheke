import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faLink,
  faBars,
  faSignInAlt,
  faSignOutAlt,
  faPeopleGroup,
  faPaperPlane,
  faPencil,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.png";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]); // alle Rollen
  const [userType, setUserType] = useState(null); // Hauptrolle
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const roles = parsedUser?.userTypes || [];

        setUserTypes(roles);

        if (roles.includes("vorstand")) {
          setUserType("vorstand");
        } else if (roles.includes("admin")) {
          setUserType("admin");
        } else {
          setUserType(null);
        }
      } catch (err) {
        console.error("Fehler beim Parsen von user:", err);
        setUserTypes([]);
        setUserType(null);
      }
    } else {
      setUserTypes([]);
      setUserType(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserTypes([]);
    setUserType(null);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${burgerMenuActive ? "burger-menu-active" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo-box">
          <NavLink to="/" onClick={() => setBurgerMenuActive(false)}>
            <img src={logo} alt="Logo" className="logo" />
          </NavLink>
        </div>

        {/* Burger Menu Icon */}
        <div
          className="menu-icon"
          onClick={() => setBurgerMenuActive(!burgerMenuActive)}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>

        {/* Navigation Items */}
        <ul className={`nav-items ${burgerMenuActive ? "active" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/events" text="Events" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/blogs" text="Blog" icon={faPencil} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/subscribe-form" text="Newsletter" icon={faPaperPlane} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/links" text="Links" icon={faLink} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/ueber-uns" text="Über Uns" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/impressum" text="Impressum" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />

          {!isLoggedIn ? (
            <NavItem to="/login" text="Login" icon={faSignInAlt} setBurgerMenuActive={setBurgerMenuActive} />
          ) : (
            <>
              {/* Wenn user BOTH admin UND vorstand ist */}
              {userTypes.includes("admin") && userTypes.includes("vorstand") && (
                <NavItem to="/vorstand" text="Vorstand" icon={faPeopleGroup} setBurgerMenuActive={setBurgerMenuActive} />
              )}

              <NavItem to="/profil" text="Profil" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />

              <li>
                <button
                  className="nav-link logout-button"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Logout
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
