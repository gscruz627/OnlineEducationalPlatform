import { proxy } from "valtio";
import type { User } from "./sources";

const state = proxy<{
    user: User | null,
    token: string | null,
    refreshToken: string | null,
    expiry: string | null,
}>({
    user: null,
    token:null,
    expiry:null,
    refreshToken:null,
});

export default state;