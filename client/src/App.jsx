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
