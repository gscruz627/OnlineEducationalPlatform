import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";
import type { Announcement, Section } from "../sources";
import "../src/App.css";
import "./styles/CourseAndSection.css";
import "./styles/MyCourses.css";

function CoursePage(){
  const { kind, sectionId } = useParams();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [section, setSection] = useState<Section|null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState<string>("");
  const [announcementDescription, setAnnouncementDescription] = useState<string>("");
  const [announcements, setAnnouncements] = useState<Array<Announcement>>([]);
  const [announcementError, setAnnounncementError] = useState("");
  const [announcementSuccess, setAnnouncementSucess] = useState("");


  async function loadSectionInformation(){
    setLoading(true);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(
        `${SERVER_URL}/api/sections/${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (!request.ok) {
        alert("Fatal Error, please reload");
        return;
      }
      const response = await request.json();
      setSection(response);
    } catch (error) {
      alert("Fatal Error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };

  async function loadAnnouncements(){
    setLoading(true);
    try{
      await checkAuth(navigate);
      const request = await fetch(
        `${SERVER_URL}/api/announcements?sectionId=${sectionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if (request.ok) {
        const response = await request.json();
        setAnnouncements(response);
      }
    } catch(err: unknown){
      alert("Fatal error, please reload");
      return;
    } finally {
      setLoading(false);
    }
  };

  async function createAnnouncement(e: React.FormEvent){
    setLoading(true);
    e.preventDefault();
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(`${SERVER_URL}/api/announcements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: announcementTitle,
          description: announcementDescription,
          sectionId: sectionId,
        }),
      });
      if (!request?.ok) {
        setAnnounncementError("Something wrong has happened, Try again!");
        setTimeout(() => {
          setAnnounncementError("");
        }, 5000);
      }
      const response = await request?.json();
      setAnnouncements([...announcements, response]);
      setAnnouncementSucess("Announcement Created!");
      setAnnouncementDescription("");
      setAnnouncementTitle("");
      setTimeout(() => {
        setAnnouncementSucess("");
      }, 5000);
    } catch (error) {
      setAnnounncementError("Something wrong has happened, Try again!");
      setTimeout(() => {
        setAnnounncementError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionInformation();
    loadAnnouncements();
  }, []);
  
  return (
    <>
    {loading && <Loading/> }
    <div className="context-menu">
      <div className="side-bar">
        <h1>{section && `${section.course?.courseCode} - ${section.sectionCode}`}</h1>
        <ul>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}`);
            }}
            >
            Announcements
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${kind}/${sectionId}/assignments/`);
            }}
          >
            Assignments
          </li>
          <li
            className="side-bar-item"
            onClick={() => {
              navigate(`/course_page/${sectionId}/students/`);
            }}
            >
            Students
          </li>
        </ul>
      </div>
      <div>
        {kind === "instructor" && (
          <>
            <h1 className="color-gray">Announcements</h1>
            <hr />

            {announcementSuccess && (
              <>
                <div className="success-box">{announcementSuccess}</div>
                <br />
              </>
            )}
            {announcementError && (
              <>
                <div className="error-box">{announcementError}</div>
                <br />
              </>
            )}

            <h2
              className="color-gray"
              style={{ textAlign: "center", margin: "1rem 0" }}
              >
              Create a new announcement
            </h2>
            <hr />
            <form
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              onSubmit={(e) => createAnnouncement(e)}
              >
              <label htmlFor="announcement_title">Title:</label>
              <input
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                type="text"
                id="announcement_title"
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                value={announcementTitle}
              ></input>

              <label htmlFor="announcement_content">Description:</label>
              <textarea
                style={{
                  fontFamily: "Lisu Bosa",
                  backgroundColor: "#FFF",
                  fontSize: "22px",
                  padding: "10px 5px",
                  border: "none",
                  borderBottom: "1px solid #000",
                  outline: "none",
                }}
                id="announcement_content"
                onChange={(e) => setAnnouncementDescription(e.target.value)}
                value={announcementDescription}
              ></textarea>

              <button type="submit" className="red-btn">
                Create
              </button>
            </form>
          </>
        )}
        <h1 className="color-gray">List of Announcements</h1>
        <hr />
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div className="announcement-box">
              <h2>{announcement.title}</h2>
              <p>{announcement.description}</p>
              <hr />
            </div>
          ))
        ) : (
          <p style={{ margin: "1rem 0" }}>No announcements to show</p>
        )}
      </div>
    </div>
  </>
  );
};

export default CoursePage;
