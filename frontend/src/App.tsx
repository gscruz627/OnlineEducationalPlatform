// React and Valtio Imports
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSnapshot } from "valtio"
import state from "../store";

// Import Views and Components
import "./App.css";
import Topbar from "../components/Topbar";
import Navbar from "../components/Navbar";

import Home from "../views/Home";
import Error from "../views/Error";
import Profile from "../views/Profile";
import LoggedOut from "../views/LoggedOut";
import Login from "../views/Login";
import Register from "../views/Register";
import Members from "../views/Members";
import AdminCourses from "../views/AdminCourses";
import AdminCourse from "../views/AdminCourse";
import AdminSection from "../views/AdminSection";
import CoursePage from "../views/CoursePage";
import CourseAssignments from "../views/CourseAssignments";
import CourseEnrollment from "../views/CourseEnrollment";
import Assignment from "../views/Assignment";
import StudentList from "../views/StudentList";
import MyCourses from "../views/MyCourses";
import { useEffect, useState } from "react";


const App = () => {
  const snap = useSnapshot(state);
  const [rehydrated, setRehydrated] = useState<boolean>(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("access-token");
    const savedRefresh = localStorage.getItem("refresh-token");
    const savedUser = localStorage.getItem("user");
    const savedSections = localStorage.getItem("sections");
    const savedExpiry = localStorage.getItem("expiry");

    if(savedToken) state.token = savedToken;
    if(savedRefresh) state.refreshToken = savedRefresh;
    if(savedUser) state.user = JSON.parse(savedUser);

    setRehydrated(true);
  }, [])
  const isAuth = snap.token ?? false;
  const role = snap.user && snap.user.role;
  const isAdmin = isAuth && role === "admin";
  const isStudent = isAuth && role === "student";
  const isNonAdmin = isAuth && role !== "admin";

  if(!rehydrated) return null;

  return (
    <BrowserRouter>
      <Topbar />
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuth ? <Navigate to="/" /> : <Register/>}/>
          <Route path="/signout" element={<LoggedOut />} />

          {/* Protected Routes */}
          <Route path="/profile/:userId" element={isAuth ? <Profile /> : <Navigate to="/login" />} />

          {/* Admin Routes */}
          <Route path="/admin_members/:kind" element={isAdmin ? <Members /> : <Navigate to="/404" />} />
          <Route path="/admin_courses" element={isAdmin ? <AdminCourses /> : <Navigate to="/404" />} />
          <Route path="/admin_individual_course/:courseId" element={isAdmin ? <AdminCourse /> : <Navigate to="/404" />} />
          <Route path="/admin_individual_section/:sectionId" element={isAdmin ? <AdminSection /> : <Navigate to="/404" />} />

          {/* Student & Instructor Routes */}
          <Route path="/my_courses/:kind" element={isAuth ? <MyCourses /> : <Navigate to="/404" />} />
          <Route path="/course_enrollment" element={isStudent ? <CourseEnrollment /> : <Navigate to="/404" />} />

          <Route path="/course_page/:kind/:sectionId/" element={isNonAdmin ? <CoursePage /> : <Navigate to="/404" />} />
          <Route path="/course_page/:kind/:sectionId/assignments" element={isNonAdmin ? <CourseAssignments /> : <Navigate to="/404" />} />
          <Route path="/course_page/:kind/:sectionId/assignments/:assignmentId" element={isNonAdmin ? <Assignment /> : <Navigate to="/404" />} />
          <Route path="/course_page/:sectionId/students" element={isNonAdmin ? <StudentList /> : <Navigate to="/404" />} />

          {/* Catch-All Route */}
          <Route path="*" element={<Error />} />
        </Routes>

        <hr style={{ width: "95%" }} />
        <p style={{ textAlign: "center" }} className="font-formal">
          By Gustavo La Cruz 2024/2025
        </p>
      </div>
    </BrowserRouter>
  );
};

export default App;
