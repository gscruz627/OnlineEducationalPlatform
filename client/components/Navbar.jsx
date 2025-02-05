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
                <li><Link to="/">HOME</Link></li>
                { (user && (role === "admin")) && (
                    <>
                        <li><Link to="/admin_courses">COURSES</Link></li>
                        <li><Link to="/admin_members/instructor">INSTRUCTORS</Link></li>
                        <li><Link to="/admin_members/student">STUDENTS</Link></li>
                    </>
                )}
                { (user && (role === "student")) && (
                    <>
                        <li><Link to="/mycourses">MY COURSES</Link></li>
                        <li><Link to="/course_enrollment">ENROLL</Link></li>
                    </>
                )}
                { (user && (role === "instructor")) && (
                    <li><Link to="/mycourses_instructor">MY COURSES</Link></li>
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