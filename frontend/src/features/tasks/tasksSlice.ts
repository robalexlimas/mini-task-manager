import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  listTasksRequest,
  createTaskRequest,
  updateTaskRequest,
  type Task,
  type TaskStatus,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "./tasksApi";

type Status = "idle" | "loading" | "succeeded" | "failed";

export type TasksState = {
  list: Task[];
  status: Status;
  error: string | null;
  filterStatus: TaskStatus | "all";
};

const initialState: TasksState = {
  list: [],
  status: "idle",
  error: null,
  filterStatus: "all",
};

export const fetchTasks = createAsyncThunk(
  "tasks/fetch",
  async (payload: { status?: TaskStatus } | undefined, { rejectWithValue }) => {
    try {
      return await listTasksRequest(payload?.status);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || "Failed to load tasks");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (payload: CreateTaskInput, { rejectWithValue }) => {
    try {
      return await createTaskRequest(payload);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async (payload: { id: number; input: UpdateTaskInput }, { rejectWithValue }) => {
    try {
      return await updateTaskRequest(payload.id, payload.input);
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || "Failed to update task");
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilterStatus(state, action: PayloadAction<TasksState["filterStatus"]>) {
      state.filterStatus = action.payload;
    },
    clearTasks(state) {
      state.list = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers(builder) {
    builder
      // fetch
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to load tasks";
      })

      // create
      .addCase(createTask.pending, (state) => {
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        // Insert al inicio
        state.list = [action.payload, ...state.list];
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to create task";
      })

      // update
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = (action.payload as string) || "Failed to update task";
      });
  },
});

export const { setFilterStatus, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
