import { useEffect, useState } from "react";
import "../src/App.css";
import { useSnapshot } from "valtio";
import state from "../store";
import "./styles/MyCourses.css";
import "./styles/CourseAndSection.css";
import { useNavigate, useParams } from "react-router-dom";

const MyCourses = () => {
  const { kind } = useParams();
  const [sections, setSections] = useState<Array<any>>([]);
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];


  const loadSections = async () => {
    const route =
      kind === "instructor"
        ? `${SERVER_URL}/api/sections?instructorId=${state.user?.userId}`
        : `${SERVER_URL}/api/enrollments?studentId=${state.user?.userId}`;
    let request = null;
    try {
      request = await fetch(route, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
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
                  {section.course?.courseCode} - {section.sectionCode}
                </h2>
                <p>{section.course?.title}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MyCourses;
