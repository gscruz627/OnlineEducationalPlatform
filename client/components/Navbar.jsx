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
                    <li>Courses</li>
                    <li><Link to="/instructors">Manage Instructors</Link></li>
                    <li>Manage Students</li>
                    </>
                )}
                { user ? (
                    <>
                    <li><Link to="/profile">{user.username}</Link></li>
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