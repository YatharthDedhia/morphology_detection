import React, { useState, useEffect } from 'react';
import './Register.css';

const Register = ({ onRegister }) => {
  // State variables for username, password, confirm password, and error handling
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if the user is already logged in, and redirect to the main page if so
  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedIn');
    if (loggedInUser === 'true') {
      window.location.replace('/');
    }
  }, []);

  // Handle the registration process when the "Submit" button is clicked
  const handleRegister = () => {
    setShowError(false); // Reset error state
    setErrorMessage('');

    if (confirmPassword === password) {
      // Perform registration logic - make API call to the server
      fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            // If registration is successful, set user as logged in and redirect to the main page
            localStorage.setItem('loggedIn', 'true');
            window.location.replace('/');
          } else {
            setShowError(true);
            setErrorMessage('Registration failed. Please check your information and try again.');
          }
        })
        .catch(error => {
          console.error('Error during registration:', error);
          setShowError(true);
          setErrorMessage('Error during registration. Please try again.');
        });
    } else {
      setShowError(true);
      setErrorMessage('Passwords do not match. Please check your information and try again.');
    }
  };

  // Close the error popup
  const closeErrorPopup = () => {
    setShowError(false);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form>
        {/* Username input field */}
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password input field */}
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Confirm Password input field */}
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {/* Submit button for registration */}
        <button type="button" onClick={handleRegister}>
          Submit
        </button>

        {/* Button to navigate to the login page */}
        <button type="button" onClick={() => {
          window.location.replace('/login');
        }}>
          Login
        </button>
      </form>

      {/* Error Popup */}
      {showError && (
        <div className="error-popup">
          <p>{errorMessage}</p>
          <button onClick={closeErrorPopup}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Register;
