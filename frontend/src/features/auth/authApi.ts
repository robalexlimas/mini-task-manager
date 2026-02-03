import api from "../../services/api";

export type User = {
    id: number;
    email: string;
};

export type AuthResponse = {
    token: string;
    user: User;
};

export async function registerRequest(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/api/register", { email, password });
    return data;
}

export async function loginRequest(email: string, password: string) {
    const { data } = await api.post<AuthResponse>("/api/login", { email, password });
    return data;
}
