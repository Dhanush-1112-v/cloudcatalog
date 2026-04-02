import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ toggleTheme }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    navigate("/");
  };

  return (
    <div className="navbar">
      
      {/* Logo Click */}
      <h2 onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
        ☁️ CloudApp
      </h2>

      {/* Dropdown */}
      {open && (
        <div className="dropdown">
          <p onClick={() => alert("Profile page coming soon 👤")}>
            👤 Profile
          </p>

          <p onClick={() => alert("Settings coming soon ⚙️")}>
            ⚙️ Settings
          </p>

          <p onClick={logout}>
            🚪 Logout
          </p>
        </div>
      )}

      {/* Theme Button */}
      <button onClick={toggleTheme}>🌙 / ☀️</button>
    </div>
  );
}

export default Navbar;