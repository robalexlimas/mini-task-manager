import api from "../../services/api";

export type TaskStatus = "pending" | "in_progress" | "done";

export type Task = {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
};

export type CreateTaskInput = {
    title: string;
    description?: string;
    status?: TaskStatus;
};

export type UpdateTaskInput = {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
};

export async function listTasksRequest(status?: TaskStatus) {
    const { data } = await api.get<Task[]>("/api/tasks", {
        params: status ? { status } : undefined,
    });
    return data;
}

export async function createTaskRequest(input: CreateTaskInput) {
    const { data } = await api.post<Task>("/api/tasks", input);
    return data;
}

export async function updateTaskRequest(taskId: number, input: UpdateTaskInput) {
    const { data } = await api.put<Task>(`/api/tasks/${taskId}`, input);
    return data;
}
