import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from "../functions";
import "./styles/Navbar.css";
import { useSnapshot } from 'valtio';
import state from '../store';

const Navbar = () => {
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate("/signout");
    }, [navigate]);

    const isAdmin = snap.user && snap.user.role === "admin";
    const isStudent = snap.user && snap.user.role === "student";
    const isInstructor = snap.user && snap.user.role === "instructor";

    return (
        <nav>
            <ul>
                <li><Link to="/">HOME</Link></li>
                
                {isAdmin && (
                    <>
                        <li><Link to="/admin_courses">COURSES</Link></li>
                        <li><Link to="/admin_members/instructor">INSTRUCTORS</Link></li>
                        <li><Link to="/admin_members/student">STUDENTS</Link></li>
                    </>
                )}

                {isStudent && (
                    <>
                        <li><Link to="/my_courses/student">MY COURSES</Link></li>
                        <li><Link to="/course_enrollment">ENROLL</Link></li>
                    </>
                )}

                {isInstructor && (
                    <li><Link to="/my_courses/instructor">MY COURSES</Link></li>
                )}

                {snap.user ? (
                    <>
                        <li><Link to={`/profile/${snap.user.id}`}>PROFILE</Link></li>
                        <li><a onClick={() => {handleLogout()}}>SIGN OUT</a></li>
                    </>
                ) : (
                    <li><Link to="/login">LOG IN</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
