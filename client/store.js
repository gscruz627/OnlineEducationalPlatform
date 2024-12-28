import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	user: null,
    token: null,
    role: null,
}

export const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
        },
}});

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;