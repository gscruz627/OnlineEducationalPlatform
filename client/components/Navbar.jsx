import React, { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLogout } from '../store';
import "./styles/Navbar.css";

const Navbar = () => {
    const user = useSelector((state) => state.user);
    const role = useSelector((state) => state.role);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logout = useCallback(() => {
        navigate("/signout");
        setTimeout(() => {
            dispatch(setLogout());
        }, 100);
    }, [navigate, dispatch]);

    const isAdmin = user && role === "admin";
    const isStudent = user && role === "student";
    const isInstructor = user && role === "instructor";

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

                {user ? (
                    <>
                        <li><Link to={`/profile/${user.id}`}>PROFILE</Link></li>
                        <li><a onClick={logout}>SIGN OUT</a></li>
                    </>
                ) : (
                    <li><Link to="/login">LOG IN</Link></li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
