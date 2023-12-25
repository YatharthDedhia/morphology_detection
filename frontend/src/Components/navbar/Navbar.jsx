import './navbar.css'
import React from 'react';

const Navbar = ({
  handleImageChange,
  handleUpload,
  handleToggleNav,
  handleUploadVideo,
  handleVideoChange
}) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="website-name">Social Media</span>
      </div>
      <div className="navbar-search">
        <input type="text" placeholder="Search" className="search-box" />
      </div>
      <label htmlFor="imageInput" className="choose-image-button">
        Choose Image
      </label>
      <input
        type="file"
        id="imageInput"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
      <button className="upload-button" onClick={handleUpload}>
        Upload Image
      </button>

      {/* video */}
      <label htmlFor="videoInput" className="choose-image-button">
        Choose Video
      </label>
      <input
        type="file"
        id="videoInput"
        onChange={handleVideoChange}
        // accept="video/*"
        style={{ display: 'none' }}
      />
      <button className="upload-button" onClick={handleUploadVideo}>
        Upload Video
      </button>
    </nav>
  );
};

export default Navbar;
