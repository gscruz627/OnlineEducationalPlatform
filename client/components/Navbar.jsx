import React from 'react'
import "../public/Navbar.css"
import { Link, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setLogout } from '../store'
const Navbar = () => {
    const user = useSelector( (state) => state.user)
    const role = useSelector( (state) => state.role)
    const dispatch = useDispatch();

    const logout = () => {
        dispatch( setLogout())
    }
    return (

        <nav>
            <ul>
                <li><Link to="/">Home</Link></li>
                { (user && (role === "admin")) && (
                    <>
                        <li><Link to="/courses">Manage Courses</Link></li>
                        <li><Link to="/instructors">Manage Instructors</Link></li>
                        <li><Link to="/students">Manage Students</Link></li>
                    </>
                )}
                { (user && (role === "student")) && (
                    <>
                        <li><Link to="/mycourses">My Courses</Link></li>
                        <li><Link to="/course_enrollment">Enroll</Link></li>
                    </>
                )}
                { (user && (role === "instructor")) && (
                    <li><Link to="/mycourses_instructor">My Courses</Link></li>
                )}
                { user ? (
                    <>
                        <li><Link to="/profile">{user.username ? user.username : user.name}</Link></li>
                        <li><a href="#" onClick={() => logout()}>SIGN OUT</a></li>
                    </>
                ) : (
                    <li><Link to="/login">LOG IN</Link></li>
                )}
            </ul>
        </nav>
    )
}

export default Navbar