import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { loginRequest, registerRequest } from "./authApi";
import type { User } from "./authApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

export type AuthState = {
  token: string | null;
  user: User | null;
  status: Status;
  error: string | null;
};

const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState: AuthState = {
  token: token || null,
  user: user ? JSON.parse(user) : null,
  status: "idle",
  error: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await registerRequest(payload.email, payload.password);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || "Register failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await loginRequest(payload.email, payload.password);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      // register
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Register failed";
      })

      // login
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Login failed";
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
