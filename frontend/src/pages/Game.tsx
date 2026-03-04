import '../styles/home.css';

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import type { CellState, PlacedShip, LogEntry } from "../types";
import { MAX_ATTEMPTS } from "../types";
import FleetPanel from "../components/Game/FleetPanel";
import BoardPanel from "../components/Game/BoardPanel";
import SidePanel from "../components/Game/SidePanel";
import { gameApi, rowColToCoord } from "../api";
import type { ApiGame, ShotResponse, GameConfig } from "../api";
import Logo from "../components/Logo";

function buildBoard(shots: ApiGame["shots"]): Record<string, CellState> {
  const board: Record<string, CellState> = {};
  shots.forEach(({ row, col, result }) => {
    const coord = rowColToCoord(row, col);
    board[coord] = result === "sunk" ? "found" : result;
  });
  return board;
}

function buildLog(shots: ApiGame["shots"]): LogEntry[] {
  return [...shots].reverse().map((s, i) => {
    const coord = rowColToCoord(s.row, s.col);
    const type: LogEntry["type"] =
      s.result === "sunk" ? "found" : s.result === "hit" ? "hit" : "miss";
    const text =
      s.result === "sunk"
      ? `${coord} → Salvat ✓`
      : s.result === "hit"
      ? `${coord} → Encert`
      : `${coord} → Aigua`;
    return { id: i + 1, type, text };
  });
}
const SHIP_BY_SIZE: Record<number, string> = {
  5: "Portaavions",
  4: "Cuirassat",
  3: "Destructor",
  2: "Patrullera",
};
function placeholderShips(ships?: { size: number }[]): PlacedShip[] {
  if (ships && ships.length > 0) {
    return ships.map((s, i) => ({
      id: i + 1,
      name: SHIP_BY_SIZE[s.size] ?? `Vaixell ${i + 1}`,
      size: s.size,
      cells: [],
      hits: [],
      found: false,
    }));
  }
  // fallback por defecto
  return [
    { id: 1, name: "Portaavions", size: 5, cells: [], hits: [], found: false },
    { id: 2, name: "Cuirassat",   size: 4, cells: [], hits: [], found: false },
    { id: 3, name: "Destructor",  size: 3, cells: [], hits: [], found: false },
    { id: 4, name: "Submarí",     size: 3, cells: [], hits: [], found: false },
    { id: 5, name: "Patrullera",  size: 2, cells: [], hits: [], found: false },
  ];
}

export default function GamePage() {
  const { state } = useLocation();

  const gameConfig: GameConfig | undefined = state && state.boardSize
    ? {
        board_size: state.boardSize,
        ships:      state.ships.map((s: { size: number }) => ({ size: s.size })),
        time_limit: state.timeLimit,
        salvo_mode: state.salvoMode,
      }
    : undefined;

  const [ships, setShips] = useState<PlacedShip[]>(
    placeholderShips(gameConfig?.ships)
  );
  const [board, setBoard]               = useState<Record<string, CellState>>({});
  const [log, setLog]                   = useState<LogEntry[]>([]);
  const [shotsTaken, setShotsTaken]     = useState(0);
  const [maxShots, setMaxShots]         = useState(MAX_ATTEMPTS);
  const [msg, setMsg]                   = useState<{ text: string; kind: "miss" | "hit" | "found" } | null>(null);
  const [seconds, setSeconds]           = useState(0);
  const [loading, setLoading]           = useState(false);
  const [shooting, setShooting]         = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [won, setWon]                   = useState(false);
  const [lastSunkShip, setLastSunkShip] = useState<PlacedShip | null>(null);
    const boardSize: number = state?.boardSize ?? 10;

  const nextId = useRef(100);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  useEffect(() => { loadGame(); }, []);

  async function loadGame() {
    setLoading(true);
    setError(null);
    try {
      let apiGame: ApiGame;
      try {
        const res = await gameApi.show();
        apiGame = res.game;
      } catch {
        const res = await gameApi.create(gameConfig);
        apiGame = res.game;
      }
      applyApiGame(apiGame);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error carregant la partida");
    } finally {
      setLoading(false);
    }
  }

  function applyApiGame(apiGame: ApiGame) {
  setBoard(buildBoard(apiGame.shots));
  setLog(buildLog(apiGame.shots));
  setShotsTaken(apiGame.shots_taken);
  setMaxShots(apiGame.max_shots);
  setWon(apiGame.status === "won");
  setSeconds(0);
  setShips(placeholderShips(gameConfig?.ships)); // <-- pasa la config
}

  const showMsg = useCallback((text: string, kind: "miss" | "hit" | "found") => {
    setMsg({ text, kind });
    setTimeout(() => setMsg(null), 2000);
  }, []);

  function addLog(type: LogEntry["type"], text: string) {
    nextId.current++;
    setLog((l) => [{ id: nextId.current, type, text }, ...l].slice(0, 25));
  }

  async function handleCell(coord: string) {
    if (board[coord] || shotsTaken >= maxShots || shooting || won) return;
    setShooting(true);
    try {
      const res: ShotResponse = await gameApi.shoot(coord);

      setShotsTaken(res.shots_taken);
      if (res.won) setWon(true);

      if (res.result === "sunk") {
        setBoard((b) => ({ ...b, [coord]: "found" }));
        setShips((prev) => {
          const idx = prev.findIndex((s) => !s.found);
          if (idx === -1) return prev;
          const updated = prev.map((s, i) => i === idx ? { ...s, found: true } : s);
          setLastSunkShip(updated[idx]);
          return updated;
        });
        addLog("found", `${coord} → Salvat ✓`);
      } else if (res.result === "hit") {
        setBoard((b) => ({ ...b, [coord]: "hit" }));
        showMsg(`${coord} — ENCERT! `, "hit");
        addLog("hit", `${coord} → Encert`);
      } else {
        setBoard((b) => ({ ...b, [coord]: "miss" }));
        showMsg(`${coord} — Aigua…`, "miss");
        addLog("miss", `${coord} → Aigua`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al disparar");
      setTimeout(() => setError(null), 3000);
    } finally {
      setShooting(false);
    }
  }

  async function newGame() {
    setLoading(true);
    setError(null);
    setWon(false);
    setLastSunkShip(null);
    try {
      const res = await gameApi.create(gameConfig);
      applyApiGame(res.game);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error creant partida");
    } finally {
      setLoading(false);
    }
  }

  async function handleAbandon() {
    if (!window.confirm("Abandonar la partida?")) return;
    setLoading(true);
    try {
      await gameApi.abandon();
      await newGame();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error abandonant");
    } finally {
      setLoading(false);
    }
  }
  
  const msgCls: Record<string, string> = {
    miss:  "border-sky-400/15 bg-[rgba(3,15,30,0.92)] text-sky-400/50",
    hit:   "border-orange-400/40 bg-orange-400/8 text-orange-300 shadow-[0_0_18px_rgba(255,107,53,.15)]",
    found: "border-sky-400/45 bg-sky-400/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,.18)]",
  };

  return (
    <>
      <div className="">
        {/* Toast */}
        {msg && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase fade-up ${msgCls[msg.kind]}`}>
            {msg.text}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border border-red-400/40 bg-red-400/8 text-red-300 font-[Cinzel] text-[.65rem] tracking-[.2em] fade-up">
            {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 z-40 bg-[rgba(3,15,30,.45)] backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="bg-[rgba(3,15,30,0.85)] border border-sky-400/15 rounded-2xl px-8 py-4">
              <span className="font-[Cinzel] text-[.65rem] tracking-[.25em] uppercase text-sky-400/60">
                Carregant…
              </span>
            </div>
          </div>
        )}

        {/* Win overlay */}
        {won && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,15,30,.88)] backdrop-blur">
            <div className="bg-[rgba(3,15,30,0.95)] border border-sky-400/20 rounded-2xl backdrop-blur-xl p-10 flex flex-col items-center gap-6 fade-up shadow-[0_0_40px_rgba(56,189,248,.1)] max-w-sm w-full mx-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-sky-400/30" />
                <span className="text-sky-400/50 text-base">⚓</span>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-sky-400/30" />
              </div>
              <div className="text-center">
                <h2
                  className="font-[Cinzel_Decorative] text-2xl text-sky-300 tracking-wider"
                  style={{ textShadow: "0 0 30px rgba(56,189,248,.35)" }}
                >
                  Flota Trobada!
                </h2>
                <p className="font-[Cinzel] text-sky-400/50 text-xs tracking-[.2em] uppercase mt-2">
                  Victòria
                </p>
              </div>
              <div className="h-px w-full bg-linear-to-r from-transparent via-sky-400/15 to-transparent" />
              <div className="flex gap-3">
                <span className="active-pill cursor-auto">{shotsTaken} intents</span>
                <span className="active-pill cursor-auto">{timerStr}</span>
              </div>
              <button onClick={newGame} className="btn">Nova partida</button>
              <Link
                to="/"
                className="font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase text-sky-400/40 hover:text-sky-400/70 transition-colors"
              >
                Menú principal
              </Link>
            </div>
          </div>
        )}

        {/* 3 panels */}
        <div className="relative z-10 flex min-h-screen">
          <FleetPanel ships={ships} board={board} />
                      <BoardPanel
              board={board}
              onCell={handleCell}
              lastSunkShip={lastSunkShip}
              onCloseSunk={() => setLastSunkShip(null)}
              boardSize={boardSize}   // <-- nuevo
            />
          <SidePanel timerStr={timerStr} log={log} onAbandon={handleAbandon} />
        </div>
      </div>
    </>
  );
}