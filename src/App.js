import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
