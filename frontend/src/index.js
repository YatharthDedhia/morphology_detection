import React from 'react';
import ReactDOM from 'react-dom';

// Create a root for React to render into
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use the root to render the app inside a StrictMode wrapper
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
