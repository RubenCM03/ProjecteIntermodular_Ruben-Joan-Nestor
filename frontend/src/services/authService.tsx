const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ==========================================
// TIPUS
// ==========================================

export interface AuthResponse {
    message: string;
    access_token: string;
    token_type: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'player';
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// ==========================================
// HELPERS
// ==========================================

function getToken(): string | null {
    return localStorage.getItem('token');
}

export function saveToken(token: string): void {
    localStorage.setItem('token', token);
}

export function removeToken(): void {
    localStorage.removeItem('token');
}

async function handleResponse<T>(res: Response): Promise<T> {
    const data = await res.json();
    if (!res.ok) throw data as ApiError;
    return data as T;
}

// ==========================================
// AUTH
// ==========================================

export async function register(name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    return handleResponse<AuthResponse>(res);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
}

export async function logout(): Promise<void> {
    const token = getToken();
    await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    removeToken();
}

export async function getUser(): Promise<User> {
    const token = getToken();
    const res = await fetch(`${API_URL}/user`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    return handleResponse<User>(res);
}