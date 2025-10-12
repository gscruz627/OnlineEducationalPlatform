import { proxy } from "valtio";

// missing import types DTO

const state = proxy<{
    user: any,
    token: any,
    refreshToken: any,
    expiry: string | null,
    enrollments: any,
    role: string | null,
    sections: any
}>({
    user: null,
    token:null,
    expiry:null,
    refreshToken:null,
    enrollments: null,
    role: null,
    sections:null
});

export default state;