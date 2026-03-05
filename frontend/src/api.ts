const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "API error");
  }

  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown) =>
  request<T>("POST", path, body);


const COLS = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;

export function coordToRowCol(coord: string): { row: number; col: number } {
  const col = COLS.indexOf(coord[0] as (typeof COLS)[number]);
  const row = parseInt(coord.slice(1), 10) - 1;
  return { row, col };
}

export function rowColToCoord(row: number, col: number): string {
  return `${COLS[col]}${row + 1}`;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "player" | "admin";
}

export interface ApiGame {
  id: number;
  status: "playing" | "won" | "lost";
  shots_taken: number;
  max_shots: number;
  shots_left: number;
  started_at: string;
  finished_at: string | null;
  shots: {
    row: number;
    col: number;
    result: "hit" | "miss" | "sunk";
  }[];
}
export interface ShotResponse {
  result: "hit" | "miss" | "sunk";
  shots_taken: number;
  game_over?: boolean;
  status?: string;
  sunk_ship?: string;
  sunk_cells?: { row: number; col: number }[];
  sunk_size?: number;
}
export interface ApiCreateResponse {
  message: string;
  game: ApiGame;
}

export interface ApiShowResponse {
  game: ApiGame;
}

export interface ShotResponse {
  result: "hit" | "miss" | "sunk";
  ship?: string;
  won: boolean;
  game: ApiGame;
}

export interface Stats {
  total_games: number;
  wins: number;
  total_attempts: number;
  avg_attempts: number;
  best_game: number | null;
  total_time_sec: number;
}

export interface HistoryEntry {
  id: number;
  status: "won" | "lost";
  shots_taken: number;
  duration: number;
  created_at: string;
}

export interface RankingEntry {
    name: string;
    total_games: number;
    won_games: number;
    win_rate: string;
    best_score: number;
}

export interface RankingResponse {
    ranking: RankingEntry[];
}

export interface GameConfig {
  board_size?: number;
  ships?: { size: number }[];
  time_limit?: number | null;
  salvo_mode?: boolean;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    post<AuthResponse>("/register", { name, email, password }),

  login: (email: string, password: string) =>
    post<AuthResponse>("/login", { email, password }),

  logout: () => post<void>("/logout"),

  me: () => get<User>("/user"),
};

export const gameApi = {
  create: (config?: GameConfig) =>
    post<ApiCreateResponse>("/game", config ?? {}),

  show: () => get<ApiShowResponse>("/game"),

  abandon: () => post<{ message: string }>("/game/abandon"),

  shoot: (coord: string) => {
    const { row, col } = coordToRowCol(coord);
    return post<ShotResponse>("/game/shoot", { row, col });
  },
};

export const statsApi = {
  myStats: () => get<{ stats: Stats }>("/stats"),
  myHistory: () => get<{ history: HistoryEntry[] }>("/history"),
  ranking: () => get<RankingResponse>("/ranking"),
  globalStats: () => get<{ global_stats: Stats }>("/admin/stats"),
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}
export function getToken() {
  return localStorage.getItem("token");
}
