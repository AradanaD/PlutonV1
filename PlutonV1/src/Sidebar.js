import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Sidebar.css'; // Import the CSS file for the sidebar

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate(); // Hook for navigation

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleResize = () => {
        if (window.innerWidth > 1024) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Logout function
    const logOut = () => {
        localStorage.setItem('token', null);
        navigate("/"); // Redirect to the login page
    };

    return (
        <>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>
            <div className={`sidebar ${isOpen ? 'show' : 'hidden'}`}>
                <ul>
                    <li>
                        <NavLink to="/AdminDashboard" activeClassName="active" className="sidebar-link">AdminDashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/Dashboard" activeClassName="active" className="sidebar-link">Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/tester" activeClassName="active" className="sidebar-link">TeamDashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/InflowOutflow" activeClassName="active" className="sidebar-link">InflowOutflow</NavLink>
                    </li>
                    <li>
                        <NavLink to="/User  Management" activeClassName="active" className="sidebar-link">Users Management</NavLink>
                    </li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="logout-button" onClick={logOut}>Logout</button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
