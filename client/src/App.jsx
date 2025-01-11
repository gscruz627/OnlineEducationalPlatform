import { useState } from 'react'
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Home from '../views/Home'
import Error from '../views/Error'
import './App.css'
import Topbar from '../components/Topbar'
import Navbar from '../components/Navbar'
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

  let isAuth = true;
  return (
    <>
      <BrowserRouter>
        <div className='main-app'>
          <Topbar/>
          <div className='main-content'>
            <Navbar/>
            <Routes>
              <Route path="/" element={ <Home/> } />
              <Route path="/profile" element={ <Profile/>} />
              <Route path="/signout" elment={ <LoggedOut/>} />
              <Route path="/login" element={ <Login />} />
              <Route path="/instructors" element={ <Instructors/>}/>
              <Route path="/createinstructor" element={ <CreateInstructor/>} />
              <Route path="/students" element={ <Students/>} />
              <Route path="/createstudent" element={ <CreateStudent/>} />
              <Route path="/courses" element={ <Courses/>} />
              <Route path="/createcourse" element={ <CreateCourse/>} />
              <Route path="/course/:courseId" element={<Course/>} />
              <Route path="/section/:sectionId" element={<Section/>} />
              <Route path="/course_enrollment" element={ <CourseEnrollment/>} />
              <Route path="/mycourses_instructor" element={ <MyCoursesInstructor/>} />
              <Route path="/course_view/instructor/:sectionId" element={ <CourseViewInstructor/>} />
              <Route path="/course_view/instructor/assignments/:sectionId" element={ <CourseAssignmentsInstructor/>} />
              <Route path="/assignment/:assignmentId" element={<Assignment/>} />
              <Route path="/course_view/instructor/student_list/:sectionId" element={ <StudentList/>} />
              <Route path="/mycourses" element={ <MyCourses/> } />
              <Route path="/course_view/student/:sectionId" element={ <CourseViewStudent/>} />
              <Route path="/course_view/student/assignments/:sectionId" element={ <CourseAssignmentsStudent/> } />
              <Route path="/assignment/student/:assignmentId" element={ <StudentAssignment/>} />
              <Route path="*" element={ <Error/>} />
            </Routes>
          <hr style={{"width":"95%"}}/>
          <p style={{"textAlign":"center"}}>Copyright 2024</p>
          </div>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
