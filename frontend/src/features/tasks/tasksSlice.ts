import { createSlice } from "@reduxjs/toolkit";

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setTasks(state, action) {
      state.list = action.payload;
    },
  },
});

export const { setTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
