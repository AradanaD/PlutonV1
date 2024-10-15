
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import AdminDashboard from './AdminDashboard';
import UserManagement from "./UserManagement";
import Tester from './Tester';
import ChangePassword from "./ChangePassword";
import Profile from "./Profile";
import "./Login.css";
import InflowOutflow from './InflowOutflow';


ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/InflowOutflow" element={<InflowOutflow />} />
      <Route path="/tester" element={<Tester />} />
      <Route path="/UserManagement" element={<UserManagement/>}/>
      <Route path="/profile" element={<Profile/>}/>
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
);
