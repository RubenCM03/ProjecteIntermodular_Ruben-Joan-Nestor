import { useState } from "react";
import '../../styles/home.css';
import { DOT_COORDS } from "../../types";
import { PanelTitle } from "./PanelTitle";
import type { DiceFace, LogEntry } from "../../types";

interface Props {
  timerStr: string;
  log: LogEntry[];
  onAbandon: () => void;
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

export default function SidePanel({ timerStr, log, onAbandon }: Props) {
  const [dice, setDice] = useState<[DiceFace, DiceFace]>([1, 1]);
  const [diceAnim, setDiceAnim] = useState(false);
  const [logOpen, setLogOpen] = useState(true);

  function rollDice() {
    if (diceAnim) return;
    setDiceAnim(true);
    setTimeout(() => {
      setDice([
        Math.ceil(Math.random() * 6) as DiceFace,
        Math.ceil(Math.random() * 6) as DiceFace,
      ]);
      setDiceAnim(false);
    }, 240);
  }

  return (
<aside className="w-52 flex-shrink-0 border-l border-sky-400/10 bg-[rgba(3,15,30,0.5)] backdrop-blur-xl p-5 flex flex-col gap-5 overflow-hidden min-h-screen">
      {/* Decorative header */}
      <div className="flex items-center gap-3 pt-1 animate-[fadeInUp_.6s_ease_.2s_forwards] opacity-0">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/25" />
        <span className="font-[Cinzel] text-[.55rem] tracking-[.25em] uppercase text-sky-400/40">
          Combat
        </span>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/25" />
      </div>

      {/* Timer */}
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

      {/* Log desplegable */}
      <div
  className="flex flex-col gap-1 pr-0.5"
  style={{
    overflowY: "auto",
    maxHeight: "16rem",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(56,189,248,0.2) rgba(56,189,248,0.04)",
  }}
>
        {/* Header clicable */}
        <button
          onClick={() => setLogOpen(v => !v)}
          className="flex items-center justify-between w-full mb-2 group cursor-pointer"
        >
          <span className="font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase text-sky-400/45 group-hover:text-sky-400/70 transition-colors">
            Registre
          </span>
          <span className={`text-sky-400/40 text-xs transition-transform duration-200 ${logOpen ? "rotate-180" : ""}`}>
            ▾
          </span>
        </button>

        {/* Lista con altura máxima y scroll */}
        {logOpen && (
          <div className="flex flex-col gap-1 overflow-y-auto max-h-64 pr-0.5">
            {log.map((e) => (
              <div
                key={e.id}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border font-[Cinzel] text-[.6rem] tracking-[.05em] fade-up transition-all flex-shrink-0 ${
                  e.type === "found"
                    ? "border-sky-400/25 bg-sky-400/8 text-sky-300"
                    : e.type === "hit"
                    ? "border-orange-400/20 bg-orange-400/5 text-orange-300"
                    : "border-sky-400/8 bg-transparent text-sky-400/40"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    e.type === "found"
                      ? "bg-sky-400"
                      : e.type === "hit"
                      ? "bg-orange-400"
                      : "bg-sky-400/30"
                  }`}
                  style={
                    e.type === "found"
                      ? { boxShadow: "0 0 6px rgba(56,189,248,.6)" }
                      : {}
                  }
                />
                {e.text}
              </div>
            ))}

            {log.length === 0 && (
              <p className="font-[Cinzel] text-[.6rem] tracking-[.1em] text-sky-400/25 text-center py-4">
                Sense dispars encara
              </p>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent flex-shrink-0" />

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