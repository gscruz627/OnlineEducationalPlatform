import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setEnrollments } from "../store";
import "../src/App.css";
import "./styles/MyCourses.css";

const CourseEnrollment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [courses, setCourses] = useState(null);
  const [sections, setSections] = useState(null);
  const [course, setCourse] = useState(null);
  const [instructors, setInstructors] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState("");

  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();

  const getAllCourses = async () => {
    const request = await fetch(`${SERVER_URL}/api/courses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await request.json();
    if (request.ok) {
      setCourses(response);
    }
  };
  const search = async (e) => {
    e.preventDefault();
    if (searchTerm === "") {
      return;
    }
    setSearched(true);
    setSearchCapture(searchTerm);

    const request = await fetch(
      `${SERVER_URL}/api/courses/search?q=${searchTerm}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const response = await request.json();
    if (request.ok) {
      setCourses(response);
    }
  };
  const clearSearch = async () => {
    setSearched(false);
    setSearchCapture(null);
    setSearchTerm("");
    await getAllCourses();
  };
  const selectCourse = async (course, courseId) => {
    const request = await fetch(
      `${SERVER_URL}/api/sections/course/${courseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const response = await request.json();
    if (request.ok) {
      setCourse(course);
      setSections(response);
    }
  };
  const loadInstructors = async () => {
    const request = await fetch(`${SERVER_URL}/api/instructors`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const response = await request.json();
    if (request.ok) {
      setInstructors(response);
    }
  };
  const executeEnroll = async (sectionId) => {
    const request = await fetch(`${SERVER_URL}/api/sections/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sectionId: sectionId,
        studentId: user.id,
      }),
    });
    if (request.ok) {
      setEnrollmentSuccess("You enrolled successfully!");
      setTimeout(() => {
        setEnrollmentSuccess("");
      }, 5000);
      const enrollmentsRequest = await fetch(
        `${SERVER_URL}/api/sections/enrollments/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const enrollmentsResponse = await enrollmentsRequest.json();
      const sectionIds = enrollmentsResponse.map((e) => e.id);
      dispatch(setEnrollments({ enrollments: sectionIds }));
      return;
    } else if (request.status === 400) {
      setEnrollmentError("You already enrolled in that course");
      setTimeout(() => {
        setEnrollmentError("");
      }, 5000);
      return;
    }
  };
  useEffect(() => {
    getAllCourses();
    loadInstructors();
  }, []);
  return (
    <div className="context-menu">
      <div className="section-selector-holder" style={{ width: "95%" }}>
        {sections ? (
          <>
            <h2>Sections for {course.title}</h2>
            {enrollmentError != "" && (
              <div className="error-box">{enrollmentError}</div>
            )}
            {enrollmentSuccess != "" && (
              <div className="success-box">{enrollmentSuccess}</div>
            )}
            {sections.map(
              (section, i) =>
                section.isActive && (
                  <div className="section-item" key={i}>
                    <div>
                      <span
                        className="section-item-user-logo"
                        style={{ fontSize: "48px", textAlign: "center" }}
                      >
                        &#128218;
                      </span>
                    </div>
                    <div>
                      <h2
                        style={{ cursor: "pointer" }}
                        onClick={() => executeEnroll(section.id)}
                      >
                        {section.courseCode} - {section.sectionCode}
                      </h2>
                      <p>
                        <b>By: </b>
                        <Link to={`/profile/${section.instructorID}`}>
                          {
                            instructors.find(
                              (instructor) =>
                                instructor.id === section.instructorID
                            )?.name
                          }
                        </Link>
                      </p>
                    </div>
                  </div>
                )
            )}
          </>
        ) : (
          <></>
        )}
      </div>

      <div>
        <form onSubmit={(e) => search(e)} style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Ex. MATH101 "
            className="input-with-side"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="blue-btn side-with-input" type="submit">
            Search
          </button>
        </form>

        <h1 className="color-gray">
          Courses Available {searched ? `(Searched: ${searchCapture})` : ""}
        </h1>
        {searchCapture && (
          <span
            style={{ color: "rgb(184, 65, 65)", cursor: "pointer" }}
            onClick={() => clearSearch()}
          >
            Clear Search
          </span>
        )}
        <hr />
        <p>Select a course and then select a section to enroll.</p>
        <div className="course-card-holder">
          {courses &&
            courses[0] &&
            courses.map((course, i) => (
              <div
                className="course-card"
                onClick={() => selectCourse(course, course.id)}
              >
                <img src={course.imageURL} />
                <div>
                  <h2>{course.courseCode}</h2>
                  <p>{course.title}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollment;
