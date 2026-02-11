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

const LOGO_API = "https://wegm-hle-apotheke-backend.onrender.com/api/logo";
const BANNER_API = "https://wegm-hle-apotheke-backend.onrender.com/api/banner";
const OPENHOURS_API = "https://wegm-hle-apotheke-backend.onrender.com/api/oeffnungszeiten";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [openHours, setOpenHours] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";


  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserTypes(parsedUser?.userTypes || []);
      } catch {
        setUserTypes([]);
      }
    }
  }, []);

  // Banner / Logo laden
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const [logoRes, bannerRes] = await Promise.all([
          axios.get(`${LOGO_API}/current`),
          axios.get(`${BANNER_API}/current`),
        ]);

        setLogoUrl(logoRes.data.logoUrl || null);
        setBannerUrl(bannerRes.data.bannerUrl || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMedia();
  }, []);

  // Öffnungszeiten laden
  useEffect(() => {
    const fetchOpenHours = async () => {
      try {
        const res = await axios.get(OPENHOURS_API);
        setOpenHours(res.data);
      } catch (err) {
        console.error("Fehler beim Abrufen der Öffnungszeiten:", err);
      }
    };
    fetchOpenHours();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <>
      {/* HERO BANNER */}
      {!isLoginPage && bannerUrl && (
        <div className="hero-banner">
          <img src={bannerUrl} alt="Banner" />
          <div className="hero-overlay">
            <h1>Wegmühle Apotheke</h1>
            <p>Gesundheit & Beratung auf höchstem Niveau</p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar">
        {/* Info Bar */}
        <div className="navbar-info">
          {openHours.length > 0 && (
            <span>
              <FontAwesomeIcon icon={faClock} />{" "}
              {openHours
                .map(h =>
                  `${h.wochentage.join(", ")}: ${
                    h.geschlossen ? "geschlossen" : h.zeiten.join(", ")
                  }`
                )
                .join(" | ")}
            </span>
          )}
          <span>
            <FontAwesomeIcon icon={faPhone} />{" "}
            <a href="tel:0900989900">Notfall: 0900 98 99 00</a>
          </span>
        </div>

        <div className="navbar-container">
          {/* Logo */}
          <NavLink to="/" className="logo-box">
            {logoUrl ? <img src={logoUrl} alt="Logo" /> : "LOGO"}
          </NavLink>

          {/* Burger */}
          <div
            className="menu-icon"
            onClick={() => setBurgerMenuActive(!burgerMenuActive)}
          >
            <FontAwesomeIcon icon={burgerMenuActive ? faTimes : faBars} />
          </div>

          {/* Navigation */}
          <ul className={`nav-items ${burgerMenuActive ? "open" : ""}`}>
            <NavItem to="/" text="Startseite" />

            <li className="dropdown">
              <span>Angebot</span>
              <ul className="dropdown-menu">
                <NavItem to="/angebote/medikamente" text="Medikamente" />
                <NavItem to="/angebote/schulmedizin" text="Schulmedizin" />
                <NavItem
                  to="/angebote/alternativmedizin"
                  text="Alternativmedizin"
                />
              </ul>
            </li>
            <NavItem to="/galerie" text="Galerie" />

            <NavItem to="/team" text="Team" />
            <NavItem to="/contact" text="Kontakt" />

            {!isLoggedIn ? (
              <NavItem to="/login" text="Login" icon={faSignInAlt} />
            ) : (
              <>
                <NavItem to="/profil" text="Profil" />
                <li>
                  <button className="logout" onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
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
        {icon && <FontAwesomeIcon icon={icon} />} {text}
      </NavLink>
    </li>
  );
}

export default Navbar;
