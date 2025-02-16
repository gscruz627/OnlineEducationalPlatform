import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	user: null,
    token: null,
    role: null,
    enrollments: [],
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
        setEnrollments: (state, action) => {
            state.enrollments = action.payload.enrollments;
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.enrollments = [];
        },
    }
});

export const { setLogin, setLogout, setEnrollments } = authSlice.actions;
export default authSlice.reducer;