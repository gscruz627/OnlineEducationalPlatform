import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSnapshot } from "valtio";
import Loading from "../components/Loading";
import state from "../store";
import checkAuth from "../functions";
import type { User } from "../sources";
import "../src/App.css";

function Profile(){

  const { userId } = useParams();
  const snap = useSnapshot(state);
  const isLocalUser = snap.user?.userId === userId;
  const SERVER_URL = import.meta.env["VITE_SERVER_URL"];
  const navigate = useNavigate();

  const [user, setUser] = useState<User|null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function loadUserInformation(){
    setLoading(true);
    let request = null;
    try {
      await checkAuth(navigate);
      request = await fetch(
        `${SERVER_URL}/api/users/${String(userId).toLocaleLowerCase()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${state.token}`,
          },
        }
      );
      if(!request.ok){
        alert("Error at loading user info");
        return;
      }
      const response = await request.json();
      setUser(response);
    } catch (error) {
      alert("Error at loading fatal");
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocalUser) {
      loadUserInformation();
    } else {
      setUser(snap.user);
      setRole(snap.user?.role!);
    }
  }, []);
  
  return (
    <>
    {loading && <Loading/> }
    <div
      style={{ textAlign: "center", margin: "1rem 0", fontFamily: "Lisu Bosa" }}
      >
      <h1 className="color-gray">
        <i className="fa-solid fa-user"></i>
        &nbsp;Profile Page
      </h1>
      {user && role === "admin" ? (
        <h2>Username: {user.username}</h2>
      ) : (
        <>
          <h2>
            <b>Name:</b> {user && (user.name ? user.name : user.username)}
          </h2>
          <h2>
            <b>Email:</b> {user && user.email}
          </h2>
        </>
      )}

      {isLocalUser ? (
        <p>You are a(n) {user && user.role}</p>
      ) : (
        <p>This user is a(n) {user && user.role}</p>
      )}
    </div>
  </>
  );
};

export default Profile;
