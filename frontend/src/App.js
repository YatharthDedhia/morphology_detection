/* Import React and necessary components from the application */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Import the styling for the application */
import './App.css';

/* Import components for authentication, registration, and the home page */
import Login from './Auth/Login';
import Register from './Auth/Register';
import Home from './Home';

/* React component for the main application */
const App = () => {
  return (
    <div className="App">
      {/* Use BrowserRouter to enable routing in the application */}
      <BrowserRouter>
        {/* Define the routes using the Routes component */}
        <Routes>
          {/* Route for the Login component */}
          <Route exact path="/login" element={<Login />} />
          {/* Route for the Register component */}
          <Route exact path="/register" element={<Register />} />
          {/* Default route for the Home component */}
          <Route exact path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

/* Export the App component for use in other files */
export default App;
