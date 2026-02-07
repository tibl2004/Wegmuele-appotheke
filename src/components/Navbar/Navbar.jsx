import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSignInAlt,
  faSignOutAlt,
  faPhone,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Navbar.scss";

// Backend-API URLs
const LOGO_API = "https://wegm-hle-apotheke-backend.onrender.com/api/logo";
const BANNER_API = "https://wegm-hle-apotheke-backend.onrender.com/api/banner";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  // Login & Rollen prüfen
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

  // Logo und Banner vom Backend abrufen
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [logoRes, bannerRes] = await Promise.all([
          axios.get(`${LOGO_API}/current`),
          axios.get(`${BANNER_API}/current`),
        ]);

        console.log("Logo Response:", logoRes.data);
        console.log("Banner Response:", bannerRes.data);

        setLogoUrl(logoRes.data.logoUrl || null);
        setBannerUrl(bannerRes.data.bannerUrl || null);
      } catch (err) {
        console.error("Fehler beim Laden von Logo oder Banner:", err);
        setLogoUrl(null);
        setBannerUrl(null);
      }
    };
    fetchMedia();
  }, []);

  // Klick außerhalb Burger-Menü schließen
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
      {/* NAVBAR */}
      <nav className={`navbar ${burgerMenuActive ? "active" : ""}`}>
        <div className="navbar-info">
          <span>
            <FontAwesomeIcon icon={faClock} /> Mo–Fr: 08:00–18:30 | Sa: 08:00–13:00
          </span>
          <span>
            <FontAwesomeIcon icon={faPhone} />{" "}
            <a href="tel:0900989900" className="phone-link">
              Notfall: 0900 98 99 00
            </a>
          </span>
        </div>

        <div className="navbar-container">
          {/* Logo */}
          <div className="logo-box">
            <NavLink to="/" onClick={() => setBurgerMenuActive(false)}>
              {logoUrl ? (
                <img src={logoUrl} alt="Wegmühle-Apotheke" className="logo" />
              ) : (
                <span className="logo-placeholder">Logo</span>
              )}
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
            <NavItem to="/galerie" text="Bilder" />
            <NavItem to="/contact" text="Kontakt" />

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

      {/* Banner dynamisch vom Backend */}
      {!isLoginPage && (
        <div className="navbar-banner">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Wegmühle-Apotheke Banner" />
          ) : (
            <div className="banner-placeholder">Banner hier</div>
          )}
        </div>
      )}
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
