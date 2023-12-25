import React from 'react';
import './navbar.css';

const Navbar = ({
  handleImageChange,
  handleUpload,
  handleToggleNav,
  handleUploadVideo,
  handleLogout
}) => {
  return (
    <nav className="navbar">
      {/* Brand/logo section */}
      <div className="navbar-brand">
        <span className="website-name">Social Media</span>
      </div>

      {/* Search input box */}
      <div className="navbar-search">
        <input type="text" placeholder="Search" className="search-box" />
      </div>

      {/* Choose Image button with associated hidden input for file selection */}
      <label htmlFor="imageInput" className="choose-image-button">
        Choose Image
      </label>
      <input
        type="file"
        id="imageInput"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />

      {/* Upload Image button */}
      <button className="upload-button" onClick={handleUpload}>
        Upload Image
      </button>

      {/* Logout button */}
      <button className="upload-button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
