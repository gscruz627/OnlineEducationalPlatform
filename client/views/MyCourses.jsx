import React, { useEffect, useState } from "react";
import "../src/App.css";
import "./styles/MyCourses.css";
import "./styles/CourseAndSection.css";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const MyCourses = () => {
  const { kind } = useParams();
  const role = useSelector((state) => state.role);
  const [sections, setSections] = useState([]);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const navigate = useNavigate();
  const loadSections = async () => {
    const route =
      kind === "instructor"
        ? `https://localhost:7004/api/instructors/sections/${user.id}`
        : `https://localhost:7004/api/sections/enrollments/${user.id}`;
    let request = null;
    try {
      request = await fetch(route, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      alert("Fatal, something wrong happened! Please reload");
      return;
    }
    if (request.ok) {
      const response = await request.json();
      setSections(response);
    }
  };
  useEffect(() => {
    loadSections();
  }, []);

  if (role !== kind) {
    navigate("/404");
  }

  return (
    <div style={{ fontFamily: "Lisu Bosa" }}>
      <h1 className="color-gray">My Courses</h1>
      <hr />
      <div className="course-card-holder holder-xl">
        {sections &&
          sections.map((section) => (
            <div
              className="course-card"
              onClick={() => navigate(`/course_page/${kind}/${section.id}`)}
            >
              <img src={section.imageURL} />
              <div>
                <h2>
                  {section.courseCode} - {section.sectionCode}
                </h2>
                <p>{section.title}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyCourses;
