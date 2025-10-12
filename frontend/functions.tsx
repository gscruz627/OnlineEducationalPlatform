import state from "./store"
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