import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CommonSideBar from "../components/CommonSideBar";
import "../src/App.css";
import "./styles/Instructors.css";

const AdminCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchCapture, setSearchCapture] = useState("");
  const [courses, setCourses] = useState(null);

  const navigate = useNavigate();
  const token = useSelector((state) => state.token);

  const SERVER_URL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    getAllCourses();
  }, []);

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
    if (searchTerm === "") return;
    setSearched(true);
    setSearchCapture(searchTerm);
    try {
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
    } catch (error) {
      alert("Something Went Wrong, Please reload!");
    }
  };

  const clearSearch = async () => {
    setSearched(false);
    setSearchCapture(null);
    setSearchTerm("");
    await getAllCourses();
  };

  return (
    <div className="context-menu">
      <CommonSideBar choice="course" updater={setCourses} />
      <div>
        <form onSubmit={(e) => search(e)} style={{ marginBottom: "1rem" }}>
          <input
            className="input-with-side"
            placeholder="Ex. ART100 or Intro to Art"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="blue-btn side-with-input" type="submit">
            Search
          </button>
        </form>

        <h1 className="color-gray">
          Courses {searched ? `(Searched: ${searchCapture})` : ""}
        </h1>

        {searchCapture && (
          <span
            style={{
              color: "rgb(184, 65, 65)",
              cursor: "pointer",
            }}
            onClick={() => clearSearch()}
          >
            Clear Search
          </span>
        )}

        <hr />

        <div className="course-card-holder">
          {courses &&
            courses[0] &&
            courses.map((course, i) => (
              <div
                key={i}
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
