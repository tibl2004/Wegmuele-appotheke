import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import LoginForm from './components/Login/LoginForm';
import Galerie from "./components/Galerie/Galerie";
import Home from "./components/Landingpage/Home";
import Team from './components/Verwaltung/Team';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/galerie" element={<Galerie />} />
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<Team />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
