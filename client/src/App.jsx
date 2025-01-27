// React and RTK Imports
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import { useSelector } from "react-redux"

// Import Views and components
import './App.css'
import Topbar from '../components/Topbar'
import Navbar from '../components/Navbar'

import Home from '../views/Home'
import Error from '../views/Error'
import Profile from '../views/Profile'
import LoggedOut from '../views/LoggedOut'
import Login from '../views/Login'
import Instructors from '../views/Instructors'
import CreateInstructor from '../views/CreateInstructor'
import Students from '../views/Students'
import CreateStudent from '../views/CreateStudent'
import Courses from '../views/Courses'
import CreateCourse from '../views/CreateCourse'
import Course from '../views/Course'
import Section from "../views/Section"
import CourseEnrollment from '../views/CourseEnrollment'
import MyCoursesInstructor from '../views/MyCoursesInstructor'
import CourseViewInstructor from '../views/CourseViewInstructor'
import CourseAssignmentsInstructor from '../views/CourseAssignmentsInstructor'
import Assignment from '../views/Assignment'
import StudentList from '../views/StudentList'
import MyCourses from '../views/MyCourses'
import CourseViewStudent from '../views/CourseViewStudent'
import CourseAssignmentsStudent from '../views/CourseAssignmentsStudent'
import StudentAssignment from '../views/StudentAssignment'

const App = () => {

  const isAuth = useSelector( (state) => state.token);
  const role = useSelector( (state) => state.role);
  return (
    <>
      <BrowserRouter>
        <div className='main-app'>
          <Topbar/>
          <div className='main-content'>
            <Navbar/>
            <Routes>
              
              <Route path="/" element={ <Home/> } />
              <Route path="/login" element={ <Login />} />
              <Route path="/signout" element={ <LoggedOut/>} />
              <Route path="/profile/:userId" element={ isAuth ? <Profile/> : <Navigate to="/login"/>} />

              <Route path="/members/:kind" element={ isAuth && (role === "admin" ) ? <Members/> : <Navigate to="/404"/>} />
              <Route path="/create_member/:kind" element={ isAuth && (role === "admin") ? <CreateMember/> : <Navigate to="/404"/> } />
              <Route path="/admin_courses" element={ isAuth && (role === "admin") ? <AdminCourses/> : <Navigate to="/404"/>} />
              <Route path="/admin_individual_course/:courseId" element={isAuth && (role === "admin") ? <AdminCourse/> : <Navigate to="/404"/>} />
              <Route path="/admin_individual_section/:sectionId" element={isAuth && (role === "admin") ? <AdminSection/> : <Navigate to="/404"/>} />          

              <Route path="/my_courses/:kind" element={ isAuth ? <MyCourses/> : <Navigate to="/404"/>} />
              <Route path="/course_enrollment" element={ isAuth ? <CourseEnrollment/> : <Navigate to="/404"/>} />
              
              <Route path="*" element={ <Error/>} />

            </Routes>
            
            <Routes path="/course_page/:sectionId">
              <Route path="/"  element={ isAuth ? <CoursePage/> : <Navigate to="/404"/> } />
              <Route path="/assignments" element={ isAuth ? <CourseAssignment/> : <Navigate to="/404"/>} />
              <Route path="/assignments/:assignmentId" element={ isAuth ? <Assignment/> : <Navigate to="/404"/>} />
              <Route path="/students" element={ isAuth ? <StudentList/> : <Navigate to="/404"/>} />
            </Routes>
          <hr style={{"width":"95%"}}/>
          <p style={{"textAlign":"center"}}>By Gustavo La Cruz 2024/2025</p>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
