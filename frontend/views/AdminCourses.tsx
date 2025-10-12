import React, { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { useNavigate } from "react-router-dom";
import CommonSideBar from "../components/CommonSideBar";
import "../src/App.css";
import "./styles/Instructors.css";
import state from "../store";

const AdminCourses = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allCourses, setAllCourses] = useState<Array<any>>([]);
  const [courses, setCourses] = useState<Array<any>>([]);
  const snap = useSnapshot(state);
  const navigate = useNavigate();

  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  useEffect(() => {
    getAllCourses();
  }, []);

  const getAllCourses = async () => {
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
  };

  useEffect(() => {
    const filteredCourses = allCourses.filter((course: any) => course.title.includes(searchTerm) || course.courseCode.includes(searchTerm));
    setCourses(filteredCourses);
  }, [searchTerm])

  return (
    <div className="context-menu">
      <CommonSideBar choice="course" updater={setCourses} />
      <div>
        <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: "1rem" }}>
          <input
            className="input-with-side"
            placeholder="Search: Ex. ART100 or Intro to Art"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <hr />

        <div className="course-card-holder">
          {courses &&
            courses[0] &&
            courses.map((course:any, i:number) => (
              <div
                key={course.id}
                className="course-card"
                onClick={() =>
                  navigate(`/admin_individual_course/${course.id}`)
                }
              >
                <img src={course.imageURL} alt="course" />
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

export default AdminCourses;
