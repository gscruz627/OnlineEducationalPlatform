import { useState, useEffect } from "react";
import { useSnapshot } from "valtio";
import { useNavigate } from "react-router-dom";
import CommonSideBar from "../components/CommonSideBar";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";
import type { Course } from "../sources";
import "../src/App.css";
import "./styles/Instructors.css";

function AdminCourses(){
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allCourses, setAllCourses] = useState<Array<Course>>([]);
  const [courses, setCourses] = useState<Array<Course>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];

  async function getAllCourses(){
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
      setErrorMessage("Something went wrong! Try Again");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const filteredCourses = allCourses.filter((course: Course) => course.title.toLowerCase().includes(searchTerm.toLowerCase()) || course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()));
    setCourses(filteredCourses);
  }, [searchTerm])

  useEffect(() => {
    getAllCourses();
  }, []);

  return (
    <>
    {loading && <Loading/>}
    <div className="context-menu">
      <CommonSideBar choice="course" updater={setCourses} />
      <div>
        <form onSubmit={(e) => e.preventDefault()} style={{ marginBottom: "1rem" }}>
          {errorMessage && <div className="error-box">{errorMessage}</div>} 
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
            courses.map((course:Course, i:number) => (
              <div
              key={course.id}
              className="course-card"
              onClick={() =>
                  navigate(`/admin_individual_course/${course.id}`)
                }
                >
                <img src={course.imageURL} alt="course" width="100%" />
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

export default AdminCourses;
