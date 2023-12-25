/* Import the associated CSS file for styling */
import './sidebar.css';

/* React component for the Sidebar */
const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Profile information section */}
      <div className="profile-info">
        {/* Profile image */}
        <img
          src="https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=3185&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Profile"
          className="profile-image"
        />
        {/* Profile details */}
        <div className="profile-details">
          <h3>John Doe</h3>
          <p>Username: johndoe123</p>
          <p>Email: johndoe@example.com</p>
          <p>Location: Cityville</p>
          <p>Joined: January 2023</p>
          <p>Bio: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Interests: Traveling, Photography, Coding</p>
          <p>Website: www.johndoe.com</p>
        </div>
      </div>
    </div>
  );
};

/* Export the Sidebar component for use in other files */
export default Sidebar;
