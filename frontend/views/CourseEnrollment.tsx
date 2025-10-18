import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../src/App.css";
import "./styles/MyCourses.css";
import state from "../store";
import { useSnapshot } from "valtio";
import checkAuth from "../functions";
import Loading from "../components/Loading";

const CourseEnrollment = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allCourses, setAllCourses] = useState<Array<any>>([]);
  const [courses, setCourses] = useState<Array<any>>([]);
  const [sections, setSections] = useState<Array<any>>([]);
  const [course, setCourse] = useState<any>(null);
  const [instructors, setInstructors] = useState<Array<any>>([]);
  const [enrollmentError, setEnrollmentError] = useState<string>("");
  const [enrollmentSuccess, setEnrollmentSuccess] = useState<string>("");

  const snap = useSnapshot(state);
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  const getAllCourses = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      const response = await request.json();
      if (request.ok) {
        setAllCourses(response);
        setCourses(response);
      }
    } catch(err: unknown){
      setEnrollmentError("Something went wrong");
      return;
    } finally {
      setLoading(false);
    }
  };
  const selectCourse = async (course:any, courseId:string) => {
    setLoading(true);
    try{

      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/sections?courseId=${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      const response = await request.json();
      if (request.ok) {
        setCourse(course);
        setSections(response);
      }
    } catch(err: unknown){
      setEnrollmentError("Something went wrong");
      return;
    } finally {
      setLoading(false);
    }
  };
  const loadInstructors = async () => {
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/users?role=instructor`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      const response = await request.json();
      if (request.ok) {
        setInstructors(response);
      }
    } catch(err: unknown){
      setEnrollmentError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const executeEnroll = async (sectionId:string) => {
    setLoading(true);
    try{
      
      await checkAuth(navigate);
      const request = await fetch(`${SERVER_URL}/api/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          sectionId: sectionId,
          studentId: snap.user?.userId,
        }),
      });
      if (request.ok) {
        setEnrollmentSuccess("You enrolled successfully!");
        setTimeout(() => {
          setEnrollmentSuccess("");
        }, 5000);
        const enrollmentsRequest = await fetch(
          `${SERVER_URL}/api/sections/enrollments/${snap.user?.userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${state.token}`,
            },
          }
        );
        return;
      } else if (request.status === 400) {
        setEnrollmentError("You already enrolled in that course");
        setTimeout(() => {
          setEnrollmentError("");
        }, 5000);
        return;
      }
    } catch(err: unknown){
      setEnrollmentError("Something went wrong");
      return;
    } finally {
      setLoading(false);
    }
  };
  useEffect( () => {
    setCourses( allCourses.filter( c => c.title.toincludes(searchTerm) || c.courseCode.includes(searchTerm)));
  }, [searchTerm])

  useEffect(() => {
    getAllCourses();
    loadInstructors();
  }, []);
  return (
    <>
    {loading && <Loading/>}
    <div className="context-menu">
      <div className="section-selector-holder" style={{ width: "95%" }}>
        {sections ? (
          <>
            <h2>{course && `Sections for ${course?.title}`}</h2>
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
                      > &nbsp;
                        <i className="fa-solid fa-book"></i>
                      </span>
                    </div>
                    <div>
                      <h2
                        style={{ cursor: "pointer" }}
                        onClick={() => executeEnroll(section.id)}
                      >
                        {section.course?.courseCode} - {section.sectionCode}
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
        <form onSubmit={(e: React.FormEvent) => e.preventDefault()} style={{ marginBottom: "1rem" }}>
          <input
            placeholder="Ex. MATH101 "
            className="input-with-side"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <h1 className="color-gray">
          Courses Available
        </h1>
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
    </>
  );
};

export default CourseEnrollment;
