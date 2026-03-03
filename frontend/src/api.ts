// ─── Base config ─────────────────────────────────────────
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

// ─── Coordinate helpers ───────────────────────────────────
// Server uses row/col (0-9). UI uses "A1"–"J10".
// col 0="A"…9="J", row 0=1…9=10

const COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

export function coordToRowCol(coord: string): { row: number; col: number } {
  const col = COLS.indexOf(coord[0] as (typeof COLS)[number]);
  const row = parseInt(coord.slice(1), 10) - 1;
  return { row, col };
}

export function rowColToCoord(row: number, col: number): string {
  return `${COLS[col]}${row + 1}`;
}

// ─── Server response types ────────────────────────────────

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

// Shape returned by formatGame() in GameController
export interface ApiGame {
  id: number;
  status: "playing" | "won" | "lost"; // GameStatus enum values
  shots_taken: number;
  max_shots: number;
  shots_left: number;
  started_at: string;
  finished_at: string | null;
  shots: {
    row: number; // 0-9
    col: number; // 0-9
    result: "hit" | "miss" | "sunk"; // ShotResult enum values
  }[];
}

export interface ApiCreateResponse {
  message: string;
  game: ApiGame;
}

export interface ApiShowResponse {
  game: ApiGame;
}

// Shot endpoint response (from ShotController)
export interface ShotResponse {
  result: "hit" | "miss" | "sunk";
  ship?: string; // ship name when sunk
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
  rank: number;
  name: string;
  wins: number;
  best_game: number;
  avg_attempts: number;
}

export interface GameConfig {
  board_size?: number;
  ships?: { size: number }[];
  time_limit?: number | null;
  salvo_mode?: boolean;
}

// ─── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    post<AuthResponse>("/register", { name, email, password }),

  login: (email: string, password: string) =>
    post<AuthResponse>("/login", { email, password }),

  logout: () => post<void>("/logout"),

  me: () => get<User>("/user"),
};

// ─── Game ─────────────────────────────────────────────────
export const gameApi = {
  /** POST /game — crea o retorna la partida activa */
  create: (config?: GameConfig) =>
    post<ApiCreateResponse>("/game", config ?? {}),

  /** GET /game — estat de la partida activa */
  show: () => get<ApiShowResponse>("/game"),

  /** POST /game/abandon */
  abandon: () => post<{ message: string }>("/game/abandon"),

  /**
   * POST /game/shoot
   * Envia row i col (0-9) al servidor.
   * Accepta coord string "A5" i la converteix internament.
   */
  shoot: (coord: string) => {
    const { row, col } = coordToRowCol(coord);
    return post<ShotResponse>("/game/shoot", { row, col });
  },
};

// ─── Stats ────────────────────────────────────────────────
export const statsApi = {
  myStats: () => get<Stats>("/stats"),
  myHistory: () => get<HistoryEntry[]>("/history"),
  ranking: () => get<RankingEntry[]>("/ranking"),
  globalStats: () => get<Stats>("/admin/stats"),
};

// ─── Token helpers ────────────────────────────────────────
export function saveToken(token: string) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
}
export function getToken() {
  return localStorage.getItem("token");
}
