// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminDashboard from "./features/admin/AdminDashboard";
import MentorDashboard from "./features/mentor/Dashboard";
import MenteeDashboard from "./features/mentee/Dashboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>    
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* ✅ Fixed path to match navigate('/admin-dashboard') */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        
        {/* ✅ Already matching */}
        <Route path="/mentor-dashboard" element={<MentorDashboard />} />
        <Route path="/mentee-dashboard" element={<MenteeDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
