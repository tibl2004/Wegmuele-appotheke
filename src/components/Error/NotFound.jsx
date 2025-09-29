import React from 'react';
import './NotFound.scss';
import notFoundGif from './404.png'; // Stelle sicher, dass die Dateipfade korrekt sind

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img src={notFoundGif} alt="404 Not Found" className="not-found-gif" />
    </div>
  );
};

export default NotFound;
