import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import EventView from './components/Events/EventView';
import EventDetail from './components/Events/EventDetail';
import Links from './components/Links/Links';
import LoginForm from './components/Login/LoginForm';
import CreateLinks from './components/Links/CreateLinks';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/events" element={<EventView />} />
          <Route path="/event/:title" element={<EventDetail />} />
          <Route path="/links" element={<Links />} />
          <Route path="/create-link" element={<CreateLinks />} />

          <Route path="/login" element={<LoginForm />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
