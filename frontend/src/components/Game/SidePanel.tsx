import { useState } from "react";
import '../../styles/home.css';
import { DOT_COORDS } from "../../types";
import { PanelTitle } from "./PanelTitle";
import type { DiceFace, LogEntry } from "../../types";

interface Props {
  timerStr: string;
  log: LogEntry[];
  onAbandon: () => void;
  turnSeconds: number;
  timeLimit: number;
  shotsTaken: number;
  maxShots: number;
}

function DiePip({ value }: { value: DiceFace }) {
  return (
    <div
      className="relative rounded-lg border border-sky-400/20 bg-[rgba(3,15,30,0.8)]"
      style={{
        width: 34,
        height: 34,
        boxShadow: "0 2px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(56,189,248,.08)",
      }}
    >
      {DOT_COORDS[value].map(([l, t], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "18%",
            height: "18%",
            left: `${l}%`,
            top: `${t}%`,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "rgba(56,189,248,.75)",
            boxShadow: "0 0 4px rgba(56,189,248,.5)",
          }}
        />
      ))}
    </div>
  );
}

export default function SidePanel({ timerStr, log, onAbandon, turnSeconds, timeLimit, shotsTaken, maxShots }: Props) {
  const [logOpen, setLogOpen] = useState(true);

  const shotsLeft    = maxShots - shotsTaken;
  const shotsWarning = shotsLeft <= Math.ceil(maxShots * 0.25);

  return (
    <aside className="w-52 flex-shrink-0 border-l border-sky-400/10 bg-[rgba(3,15,30,0.5)] backdrop-blur-xl p-5 flex flex-col gap-5 overflow-hidden min-h-screen">

      {/* Decorative header */}
      <div className="flex items-center gap-3 pt-1 animate-[fadeInUp_.6s_ease_.2s_forwards] opacity-0">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/25" />
        <span className="font-[Cinzel] text-[.55rem] tracking-[.25em] uppercase text-sky-400/40">Combat</span>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/25" />
      </div>

      {/* Global timer */}
      <div className="animate-[fadeInUp_.6s_ease_.3s_forwards] opacity-0 flex-shrink-0">
        <PanelTitle>Temporitzador</PanelTitle>
        <div className="bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-xl p-4 text-center">
          <div
            className="font-[Cinzel_Decorative] text-3xl text-sky-300 tracking-widest leading-none"
            style={{ textShadow: "0 0 20px rgba(56,189,248,.3)" }}
          >
            {timerStr}
          </div>
          <div className="font-[Cinzel] text-[.55rem] tracking-[.2em] uppercase text-sky-400/40 mt-2">
            Temps transcorregut
          </div>
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent flex-shrink-0" />

      {/* Turn timer — only shown if timeLimit > 0 */}
      {timeLimit > 0 && (
        <div className="flex-shrink-0">
          <PanelTitle>Temps per torn</PanelTitle>
          <div className="bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-xl p-4 text-center">
            <div
              className={`font-[Cinzel_Decorative] text-3xl tracking-widest leading-none transition-colors duration-300 ${
                turnSeconds >= timeLimit * 0.75 ? "text-red-300" : "text-sky-300"
              }`}
              style={{
                textShadow: turnSeconds >= timeLimit * 0.75
                  ? "0 0 20px rgba(248,56,56,.4)"
                  : "0 0 20px rgba(56,189,248,.3)",
              }}
            >
              {Math.max(0, timeLimit - turnSeconds)}s
            </div>
            <div className="h-1 rounded-full bg-sky-400/8 border border-sky-400/10 overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  turnSeconds >= timeLimit * 0.75
                    ? "bg-linear-to-r from-red-500/60 to-red-300/80"
                    : "bg-linear-to-r from-sky-500/60 to-sky-300/80"
                }`}
                style={{
                  width: `${Math.max(0, ((timeLimit - turnSeconds) / timeLimit) * 100)}%`,
                  boxShadow: turnSeconds >= timeLimit * 0.75
                    ? "0 0 8px rgba(248,56,56,.4)"
                    : "0 0 8px rgba(56,189,248,.4)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Shots counter */}
      <div className="flex-shrink-0">
        <PanelTitle>Intents</PanelTitle>
        <div className="bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-xl p-4 text-center">
          <div
            className={`font-[Cinzel_Decorative] text-3xl tracking-widest leading-none transition-colors duration-300 ${
              shotsWarning ? "text-red-300" : "text-sky-300"
            }`}
            style={{
              textShadow: shotsWarning
                ? "0 0 20px rgba(248,56,56,.4)"
                : "0 0 20px rgba(56,189,248,.3)",
            }}
          >
            {shotsLeft}
          </div>
          
          <div className="font-[Cinzel] text-[.55rem] tracking-[.2em] uppercase text-sky-400/40 mt-2">
            {shotsTaken} / {maxShots} usats
          </div>
        </div>
      </div>

      

      

      <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

      {/* Abandon button */}
      <div className="animate-[fadeInUp_.6s_ease_.5s_forwards] opacity-0 flex-shrink-0">
        <button
          onClick={onAbandon}
          className="w-full py-2.5 px-3 rounded-xl border border-red-400/20 bg-red-400/4 text-red-400/60 font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase hover:bg-red-400/10 hover:border-red-400/40 hover:text-red-300 transition-all duration-200 cursor-pointer"
        >
          Abandonar
        </button>
      </div>
    </aside>
  );
}