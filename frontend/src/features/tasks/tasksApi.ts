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
    const { data: { tasks } } = await api.get<{ tasks: Task[] }>("/api/tasks", {
        params: status ? { status } : undefined,
    });
    return tasks;
}

export async function createTaskRequest(input: CreateTaskInput) {
    const { data: { task } } = await api.post<{ task: Task }>("/api/tasks", input);
    return task;
}

export async function updateTaskRequest(taskId: number, input: UpdateTaskInput) {
    const { data: { task } } = await api.put<{ task: Task }>(`/api/tasks/${taskId}`, input);
    return task;
}
