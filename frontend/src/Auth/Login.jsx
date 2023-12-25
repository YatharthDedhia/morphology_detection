import React, { useState, useEffect } from 'react';
import './Login.css';

const Login = () => {
  // State variables for username, password, and error messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check if the user is already logged in, and redirect to the main page if so
  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedIn');
    if (loggedInUser === 'true') {
      window.location.replace('/');
    }
  }, []);

  // Handle the login process when the "Submit" button is clicked
  const handleLogin = () => {
    // Clear previous errors
    setError('');

    // Perform login logic - make API call to the server
    fetch('http://localhost:4000/login', {
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
          // If login is successful, set user as logged in and redirect to the main page
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          window.location.replace('/');
        } else {
          setError('Login failed');
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
        setError('Error during login. Please try again.');
      });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form>
        {/* Username input field */}
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        {/* Password input field */}
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {/* Submit button for login */}
        <button type="button" onClick={handleLogin}>
          Submit
        </button>

        {/* Button to navigate to the registration page */}
        <button
          type="button"
          onClick={() => {
            window.location.replace('/register');
          }}
        >
          Register
        </button>

        {/* Display error message if login fails */}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
