import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar-container">
      <div className="nav-menu">
        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-item letter-space-wide active" : "nav-item letter-space-wide")}>
          Dashboard
        </NavLink>
        <NavLink to="/data-sensor" className={({ isActive }) => (isActive ? "nav-item letter-space-wide active" : "nav-item letter-space-wide")}>
          Data Sensor
        </NavLink>
        <NavLink to="/action-history" className={({ isActive }) => (isActive ? "nav-item letter-space-wide active" : "nav-item letter-space-wide")}>
          Action
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "nav-item letter-space-wide active" : "nav-item letter-space-wide")}>
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;