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
