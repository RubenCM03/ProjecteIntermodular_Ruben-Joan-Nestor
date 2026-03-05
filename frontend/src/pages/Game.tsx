import '../styles/home.css';
import VictoryOverlay from '../components/Game/VictoryOverlay';
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { CellState, PlacedShip, LogEntry } from "../types";
import { MAX_ATTEMPTS } from "../types";
import FleetPanel from "../components/Game/FleetPanel";
import BoardPanel from "../components/Game/BoardPanel";
import SidePanel from "../components/Game/SidePanel";
import { gameApi, rowColToCoord } from "../api";
import type { ApiGame, ShotResponse } from "../api";

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
  const navigate  = useNavigate();

  const boardSize: number = state?.boardSize ?? 10;
  const timeLimit: number = state?.timeLimit ?? 0;

  const gameConfig = state?.boardSize
    ? {
        board_size: state.boardSize,
        ships:      state.ships.map((s: { size: number }) => ({ size: s.size })),
        max_shots:  state.maxShots > 0 ? state.maxShots : undefined,
        salvo_mode: state.salvoMode,
      }
    : undefined;

  const [ships, setShips]               = useState<PlacedShip[]>(placeholderShips(gameConfig?.ships));
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
  const [lost, setLost]                 = useState(false);
  const [lostReason, setLostReason]     = useState<"time" | "shots">("shots");
  const [lastSunkShip, setLastSunkShip] = useState<PlacedShip | null>(null);
  const [turnSeconds, setTurnSeconds]   = useState(0);

  const nextId       = useRef(100);
  const turnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (won || lost) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [won, lost]);

  const timerStr = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  function startTurnTimer() {
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    setTurnSeconds(0);
    if (timeLimit > 0) {
      turnTimerRef.current = setInterval(() => {
        setTurnSeconds((s) => s + 1);
      }, 1000);
    }
  }

  function stopTurnTimer() {
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    turnTimerRef.current = null;
  }

  useEffect(() => {
    if (timeLimit > 0 && turnSeconds >= timeLimit && !won && !lost && turnTimerRef.current) {
      stopTurnTimer();
      setLostReason("time");
      setLost(true);
    }
  }, [turnSeconds, timeLimit, won, lost]);

  useEffect(() => () => stopTurnTimer(), []);
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
    setLost(apiGame.status === "lost");
    setSeconds(0);
    setTurnSeconds(0);
    stopTurnTimer();
    setShips(placeholderShips(gameConfig?.ships));
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
    if (board[coord] || shotsTaken >= maxShots || shooting || won || lost) return;
    setShooting(true);
    try {
      const res: ShotResponse = await gameApi.shoot(coord);
      const newShotsTaken = res.shots_taken;
      setShotsTaken(newShotsTaken);

      // Processar resultat del tir
      if (res.result === "sunk") {
        setBoard((b) => ({ ...b, [coord]: "found" }));
        const sunkSize = res.sunk_size ?? 0;
        setShips((prev) => {
          const idx = prev.findIndex((s) => !s.found && (sunkSize === 0 || s.size === sunkSize));
          if (idx === -1) return prev;
          const updated = [...prev];
          updated[idx] = { ...updated[idx], found: true };
          setLastSunkShip(updated[idx]);
          return updated;
        });
        showMsg(`${coord} — SALVAT! ⚓`, "found");
        addLog("found", `${coord} → Salvat ✓`);
      } else if (res.result === "hit") {
        setBoard((b) => ({ ...b, [coord]: "hit" }));
        showMsg(`${coord} — ENCERT! 🎯`, "hit");
        addLog("hit", `${coord} → Encert`);
      } else {
        setBoard((b) => ({ ...b, [coord]: "miss" }));
        showMsg(`${coord} — Aigua…`, "miss");
        addLog("miss", `${coord} → Aigua`);
      }

      // Comprovar fi de partida
      if (res.game_over && res.status === "won") {
        stopTurnTimer();
        setWon(true);
        return;
      }

      if (res.game_over && res.status === "lost") {
        stopTurnTimer();
        setLostReason("shots");
        setLost(true);
        return;
      }

      // Fallback: si s'han esgotat els intents i el backend no ha dit game_over
      if (newShotsTaken >= maxShots) {
        stopTurnTimer();
        setLostReason("shots");
        setLost(true);
        return;
      }

      startTurnTimer();

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
    setLost(false);
    setLastSunkShip(null);
    stopTurnTimer();
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
    stopTurnTimer();
    try {
      await gameApi.abandon();
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error abandonant");
    } finally {
      setLoading(false);
    }
  }

  const msgCls: Record<string, string> = {
    miss:  "border-sky-400/15 bg-[rgba(3,15,30,0.92)] text-sky-400/50",
    hit:   "border-yellow-400/40 bg-yellow-400/8 text-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.15)]",
    found: "border-green-400/45 bg-green-400/10 text-green-300 shadow-[0_0_18px_rgba(74,222,128,.18)]",
  };

  return (
    <>
      <div className="">
        {msg && (
          <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase fade-up ${msgCls[msg.kind]}`}>
            {msg.text}
          </div>
        )}

        {error && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border border-red-400/40 bg-red-400/8 text-red-300 font-[Cinzel] text-[.65rem] tracking-[.2em] fade-up">
            {error}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-40 bg-[rgba(3,15,30,.45)] backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="bg-[rgba(3,15,30,0.85)] border border-sky-400/15 rounded-2xl px-8 py-4">
              <span className="font-[Cinzel] text-[.65rem] tracking-[.25em] uppercase text-sky-400/60">
                Carregant…
              </span>
            </div>
          </div>
        )}

        {/* Victory overlay */}
        {won && (
          <VictoryOverlay
            shotsUsed={shotsTaken}
            timeStr={timerStr}
            onClose={() => setWon(false)}
            onPlayAgain={newGame}
          />
        )}

        {/* Loss overlay */}
        {lost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,15,30,.88)] backdrop-blur">
            <div className="bg-[rgba(3,15,30,0.95)] border border-red-400/20 rounded-2xl backdrop-blur-xl p-10 flex flex-col items-center gap-6 fade-up shadow-[0_0_40px_rgba(248,56,56,.1)] max-w-sm w-full mx-4">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-linear-to-r from-transparent to-red-400/30" />
                <span className="text-red-400/50 text-base">💀</span>
                <div className="h-px w-12 bg-linear-to-l from-transparent to-red-400/30" />
              </div>
              <div className="text-center">
                <h2 className="font-[Cinzel_Decorative] text-2xl text-red-300 tracking-wider"
                  style={{ textShadow: "0 0 30px rgba(248,56,56,.35)" }}>
                  {lostReason === "time" ? "Temps Esgotat!" : "Sense Intents!"}
                </h2>
                <p className="font-[Cinzel] text-red-400/50 text-xs tracking-[.2em] uppercase mt-2">Derrota</p>
              </div>
              <div className="h-px w-full bg-linear-to-r from-transparent via-red-400/15 to-transparent" />
              <div className="flex gap-3">
                <span className="active-pill cursor-auto">{shotsTaken} intents</span>
                <span className="active-pill cursor-auto">{timerStr}</span>
              </div>
              <button onClick={newGame} className="btn">Nova partida</button>
              <Link to="/" className="font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase text-sky-400/40 hover:text-sky-400/70 transition-colors">
                Menú principal
              </Link>
            </div>
          </div>
        )}

        <div className="relative z-10 flex min-h-screen">
          <FleetPanel ships={ships} board={board} />
          <BoardPanel
            board={board}
            onCell={handleCell}
            lastSunkShip={lastSunkShip}
            onCloseSunk={() => setLastSunkShip(null)}
            boardSize={boardSize}
          />
          <SidePanel
            timerStr={timerStr}
            log={log}
            onAbandon={handleAbandon}
            turnSeconds={turnSeconds}
            timeLimit={timeLimit}
            shotsTaken={shotsTaken}
            maxShots={maxShots}
          />
        </div>
      </div>
    </>
  );
}