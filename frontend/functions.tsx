import { jwtDecode } from "jwt-decode";
import state from "./store";
import type { NavigateFunction } from "react-router-dom";
import type { CustomJwtPayload } from "./sources"

export function logout(){
    state.user = null;
    state.expiry = null;
    state.refreshToken = null;
    state.token = null;
    state.sections = null;
    localStorage.removeItem("access-token");
    localStorage.removeItem("refresh-token");
    localStorage.removeItem("expiry");
    localStorage.removeItem("user");
}

let refreshPromise: Promise<boolean> | null = null;

export default async function checkAuth(navigate: NavigateFunction): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }
  console.log("Testing check auth validity of token");
  console.log("Right Now: " + new Date().getTime());
  console.log("Token expires at: " + localStorage.getItem("expiry") + " " + state.expiry + " " + Number(state.expiry));

  if (new Date().getTime() < Number(localStorage.getItem("expiry")) * 1000) {
    console.log("NOT EXPIRED");
    return true;
  }
  console.log("EXPIRED, OBTAINING NEW...");

  refreshPromise = (async () => {
    const SERVER_URL = import.meta.env.VITE_SERVER_URL;
    try {
      const request = await fetch(`${SERVER_URL}/api/users/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          accessToken: state.token,
          refreshToken: state.refreshToken
        })
      });

      if (!request.ok) {
        refreshPromise = null;
        navigate("/login")
        return false;
      }

      const tokens = await request.json();

      state.token = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.expiry = String(jwtDecode<any>(tokens.accessToken).exp);
      console.log("OBTAINED FROM SERVER: " + String(jwtDecode<any>(tokens.accessToken).exp));

      localStorage.setItem("access-token", tokens.accessToken);
      localStorage.setItem("refresh-token", tokens.refreshToken);
      localStorage.setItem("expiry", String(jwtDecode<any>(tokens.accessToken).exp)!);
        
      refreshPromise = null;
      return true;
    } catch {
      refreshPromise = null;
      navigate("/login")
      return false;
    }
  })();

  return refreshPromise;
}