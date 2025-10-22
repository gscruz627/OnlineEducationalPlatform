import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSnapshot } from "valtio";
import state from "../store";
import checkAuth from "../functions";
import Loading from "../components/Loading";
import type { Submission, Section, Assignment, Announcement } from "../sources";
import "../src/App.css";

function Home(){
  const navigate = useNavigate();
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];
 
  // Information for Instructor
  const snap = useSnapshot(state);
  const [loading, setLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<Array<Section>>([]);
  const [submissions, setSubmissions] = useState<Array<Submission>>([]);
  const [assignments, setAssignments] = useState<Array<Assignment>>([]);
  const [announcements, setAnnouncements] = useState<Array<Announcement>>([]);

  
  async function loadAnnouncements(sectionId:string){
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

        console.log(response[0]);

        setAnnouncements((prev: Array<Announcement>) => {
  // Filter out any announcements already in state
  const newAnnouncements = response.filter(
    (newItem: Announcement) => !prev.some(item => item.id === newItem.id)
  );

  // Append all new announcements
  return [...prev, ...newAnnouncements];
});
      }

    } catch(err: unknown){
      alert("Fatal, something wrong happened! Please reload");
      return;
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  console.log("announcement updates:");
  console.log(typeof(announcements));
  console.log(announcements.length);
  console.log(announcements[0], announcements[1])
  announcements.forEach(element => {
    console.log(element)
  });
}, [announcements]);

  useEffect( () => {
    console.log("assignments update: " + assignments);
  }, [assignments])

  useEffect( () => {
    console.log("submissions updates: " + submissions)
  })

  async function loadSections(){
    setLoading(true);
    let route = "";
    if(snap.user?.role){
      route = (snap.user?.role === "instructor")
        ? `${SERVER_URL}/api/sections?instructorId=${snap.user.userId}`
        : `${SERVER_URL}/api/enrollments?userId=${snap.user.userId}`; 
    }
    console.log(route);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(route, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      console.log(request.status)
      if (request.ok) {
        const response = await request.json();
        console.log(response);
        setSections(response);
      }
    } catch (error) {
      alert("Fatal, something wrong happened! Please reload");
      return;
    } finally {
      setLoading(false);
    }
  };
async function loadAssignments(sectionId: string) {
  setLoading(true);
  try {
    await checkAuth(navigate);

    const request = await fetch(
      `${SERVER_URL}/api/assignments?sectionId=${sectionId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      }
    );

    if (request.ok) {
      const response: Array<Assignment> = await request.json();
      console.log('Fetched assignments for section', sectionId, response);

      // Add new assignments to state, avoiding duplicates
      setAssignments((prev: Array<Assignment>) => {
        const newAssignments = response.filter(
          (newItem) => !prev.some(item => item.id === newItem.id)
        );
        return [...prev, ...newAssignments];
      });

      // Fetch submissions for each assignment
      response.forEach((assignment: Assignment) => loadSubmissions(assignment.id));
    }
  } catch (err: unknown) {
    alert("Fatal, something wrong happened! Please reload");
    console.error(err);
  } finally {
    setLoading(false);
  }
}


async function loadSubmissions(assignmentId: string) {
  setLoading(true);
  try {
    await checkAuth(navigate);

    const request = await fetch(
      `${SERVER_URL}/api/assignments/${assignmentId}/submissions`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      }
    );

    if (request.ok) {
      const response: Array<Submission> = await request.json();
      console.log('Fetched submissions for assignment', assignmentId, response);

      setSubmissions((prev: Array<Submission>) => {
        // Filter out any submissions already in state
        const newSubmissions = response.filter(
          (newItem) => !prev.some(item => item.id === newItem.id)
        );
        return [...prev, ...newSubmissions];
      });
    } else {
      console.error('Failed to fetch submissions for assignment', assignmentId);
    }
  } catch (error) {
    alert("Fatal Error, try again!");
    console.error(error);
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    if (snap.user?.role !== "admin") {
      loadSections();
    }
  }, []);

  useEffect(() => {
    if (snap.user?.role !== "admin") {
      sections.forEach((section:Section) => loadAssignments(section.sectionId ?? section.id));
      sections.forEach((section:Section) => loadAnnouncements(section.sectionId ?? section.id));
    }
  }, [sections]);

  return (
    <>
      {loading && <Loading /> }
      {!snap.user && (
        <section className="font-formal" style={{ textAlign: "center" }}>
          <h1 className="color-gray" style={{ fontSize: "48px" }}>
            Welcome
          </h1>
          <p>Please login to access your courses.</p>

          <button
            style={{ margin: "2rem 0", textAlign: "center" }}
            className="blue-btn"
          >
            <Link to="/login">Sign In Here</Link>
          </button>
        </section>
      )}
      {snap.user && snap.user.role === "admin" && (
        <section style={{ fontFamily: "Lisu Bosa" }}>
          <h1 style={{ fontSize: "48px" }}>Online Learning Platform</h1>
          <h2 className="color-gray">Admin Manager Center</h2>
          <hr />
          <p style={{ marginTop: "2rem" }}>
            Manage:{" "}
            <Link to="/admin_courses" style={{ color: "#298D29" }}>
              Courses
            </Link>
            ,{" "}
            <Link to="/admin_members/student" style={{ color: "#298D29" }}>
              Students
            </Link>
            ,{" "}
            <Link to="/admin_members/instructor" style={{ color: "#298D29" }}>
              Instructors
            </Link>
          </p>

          <h1>Created by Gustavo La Cruz, February 2025</h1>
        </section>
      )}
      {snap.user && snap.user?.role !== "admin" && <div style={{fontFamily: "Sofia Pro"}}>
      <h1>Welcome to Online Educational Platform.</h1>
      <p>View your courses here: </p>
      <Link to={`/my_courses/${snap.user?.role}`}> My Courses</Link>
      </div>
      }
    </>
  );
};

export default Home;
