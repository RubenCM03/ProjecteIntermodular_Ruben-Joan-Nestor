import '../styles/home.css';

import { useState, useEffect, useRef, useCallback } from "react";
import type { CellState, PlacedShip, LogEntry } from "../types";
import { MAX_ATTEMPTS } from "../types";
import FleetPanel from "../components/Game/FleetPanel";
import BoardPanel from "../components/Game/BoardPanel";
import SidePanel from "../components/Game/SidePanel";
import VictoryOverlay from '../components/Game/VictoryOverlay'
import { gameApi, rowColToCoord } from "../api";
import type { ApiGame, ShotResponse } from "../api";
import { Link, useNavigate } from "react-router-dom";
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
        ? `${coord} → Enfonsat ✓`
        : s.result === "hit"
          ? `${coord} → Encert`
          : `${coord} → Aigua`;
    return { id: i + 1, type, text };
  });
}

function placeholderShips(): PlacedShip[] {
  return [
    { id: 1, name: "Portaavions", size: 5, cells: [], hits: [], found: false },
    { id: 2, name: "Cuirassat", size: 4, cells: [], hits: [], found: false },
    { id: 3, name: "Destructor", size: 3, cells: [], hits: [], found: false },
    { id: 4, name: "Submarí", size: 3, cells: [], hits: [], found: false },
    { id: 5, name: "Patrullera", size: 2, cells: [], hits: [], found: false },
  ];
}

export default function GamePage() {
  const [ships, setShips] = useState<PlacedShip[]>(placeholderShips());
  const [board, setBoard] = useState<Record<string, CellState>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [shotsTaken, setShotsTaken] = useState(0);
  const [maxShots, setMaxShots] = useState(MAX_ATTEMPTS);
  const [msg, setMsg] = useState<{ text: string; kind: "miss" | "hit" | "found" } | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const nextId = useRef(100);
  const navigate = useNavigate();

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
        const res = await gameApi.create();
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
    setShips(placeholderShips());
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
    if (board[coord] || shotsTaken >= maxShots || loading || won) return;
    setLoading(true);
    try {
      const res: ShotResponse = await gameApi.shoot(coord);
      setShotsTaken(res.game.shots_taken);
      setWon(res.won);

      if (res.result === "sunk") {
        setBoard((b) => ({ ...b, [coord]: "found" }));
        const shipName = res.ship ?? "Vaixell";
        showMsg(`${shipName} ENFONSAT! 🎉`, "found");
        addLog("found", `${coord} → ${shipName} ✓`);
        setShips((prev) =>
          prev.map((s) =>
            s.name === shipName ? { ...s, found: true, hits: [...s.hits, coord] } : s
          )
        );
      } else if (res.result === "hit") {
        setBoard((b) => ({ ...b, [coord]: "hit" }));
        showMsg(`${coord} — ENCERT! 🎯`, "hit");
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
      setLoading(false);
    }
  }

  async function newGame() {
    setLoading(true);
    setError(null);
    setWon(false);
    try {
      const res = await gameApi.create();
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
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error abandonant");
      setLoading(false);
    }
  }

  // Toast styles matching GameConfig pill / card aesthetic
  const msgCls: Record<string, string> = {
    miss: "border-sky-400/15 bg-[rgba(3,15,30,0.92)] text-sky-400/50",
    hit: "border-orange-400/40 bg-orange-400/8 text-orange-300 shadow-[0_0_18px_rgba(255,107,53,.15)]",
    found: "border-sky-400/45 bg-sky-400/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,.18)]",
  };

  return (
    <>
      <div className="">





        {/* Toast */}
        {msg && (
          <div
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase fade-up ${msgCls[msg.kind]}`}
          >
            {msg.text}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl border border-red-400/40  -red-400/8 text-red-300 font-[Cinzel] text-[.65rem] tracking-[.2em] fade-up">
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

        {/* Win overlay — matches GameConfig card style */}
        {won && (
            <VictoryOverlay
                shotsUsed={shotsTaken}
                timeStr={timerStr}
                onClose={() => setWon(false)}
                onPlayAgain={newGame}
            />
        )}

        {/* 3 panels */}
        <div className="relative z-10 flex flex-1 min-h-0 overflow-hidden">
          <FleetPanel ships={ships} board={board} />
          <BoardPanel board={board} onCell={handleCell} />
          <SidePanel timerStr={timerStr} log={log} onAbandon={handleAbandon} />
        </div>
      </div>
    </>
  );
}