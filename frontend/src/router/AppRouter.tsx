import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import HowItWorks from "@/pages/HowItWorks";
import Login from "@/features/auth/Login";
import Register from "@/features/auth/Register";
import ForgotPassword from "@/features/auth/ForgotPassword";
import MentorDashboard from "@/features/mentor/Dashboard";
import MenteeDashboard from "@/features/mentee/Dashboard";
import AdminDashboard from "@/features/admin/AdminDashboard";
import AllMatches from "@/features/admin/AllMatches";
import AllUsers from "@/features/admin/AllUsers";
import AllSections from "@/features/admin/AllSessions";
import NotFound from "@/pages/NotFound";
import AuthLayout from "@/layouts/AuthLayout";
import Requests from "@/features/mentor/Requests";
import Availability from "@/features/mentor/Availability";
import Sessions from "@/features/mentor/Sessions";
import MySessions from "@/features/mentee/MySessions";
import Profile from "@/pages/Profile";
import BrowseMentors from "@/features/mentee/BrowseMentors";
//import RequestSession from "@/features/mentee/RequestSession";//
import MenteeRequests from "@/features/mentee/MyRequests";
import BookSession from "@/features/mentee/BookSession";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Pages (Login, Register, Forgot Password) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Role Dashboards */}
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        <Route path="/mentee/dashboard" element={<MenteeDashboard />} />
        <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/admin/AllMatches" element={<AllMatches />} />
        <Route path="/admin/AllUsers" element={<AllUsers />} />
        <Route path="/admin/AllSessions" element={<AllSections />} />
        <Route path="/mentor/requests" element={<Requests />} />
        <Route path="/mentor/availability" element={<Availability />} />
        <Route path="/mentor/sessions" element={<Sessions />} />
        <Route path="/mentee/browse"  element= {<BrowseMentors />}/>
        <Route path="/mentee/sessions"  element= {<MySessions />}/>
        <Route path="/mentee/requests"  element= {<MenteeRequests />}/>
        <Route  path="/mentee/book-session" element = {<BookSession />} />

        <Route path="/About" element={<About/>} />
        <Route path="/" element={<Home/>} />
        <Route path="/Contact" element={<Contact/>} />
        <Route path="/HowItWorks" element={<HowItWorks/>} />
        <Route path="/Profile" element={<Profile/>} />

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
