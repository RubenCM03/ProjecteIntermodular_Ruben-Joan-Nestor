import { useState } from "react";
import { COLS, ROWS } from "../../types";
import type { CellState } from "../../types";

interface Props {
  board: Record<string, CellState>;
  onCell: (coord: string) => void;
}

function BoardCell({ state, onClick }: { state: CellState; onClick: () => void }) {
  const [ripple, setRipple] = useState(false);

  const cls: Record<CellState, string> = {
    empty:
      "bg-[rgba(3,15,30,0.55)] border-sky-400/10 cursor-pointer hover:bg-sky-400/10 hover:border-sky-400/40 hover:scale-105",
    miss: "bg-sky-900/20 border-sky-400/15 cursor-default",
    hit: "bg-red-500/10 border-red-400/40 cursor-default",
    found: "bg-sky-400/15 border-sky-400/50 cursor-default",
  };

  function click() {
    if (state !== "empty") return;
    setRipple(true);
    setTimeout(() => setRipple(false), 520);
    onClick();
  }

  return (
    <div
      onClick={click}
      className={`relative flex items-center justify-center rounded-md border transition-all duration-150 select-none ${cls[state]} ${state === "hit" ? "hit-pop" : ""}`}
      style={{ width: 40, height: 40 }}
    >
      {ripple && <div className="cell-ripple" />}
      {state === "miss" && (
        <span className="text-sky-400/40 text-xl leading-none">·</span>
      )}
      {state === "hit" && (
        <span
          style={{ color: "#ff6b35", fontSize: 13, textShadow: "0 0 8px #ff6b35" }}
        >
          ✕
        </span>
      )}
      {state === "found" && (
        <span className="text-sky-400 text-xs" style={{ textShadow: "0 0 10px rgba(56,189,248,.8)" }}>
          ◆
        </span>
      )}
    </div>
  );
}

export default function BoardPanel({ board, onCell }: Props) {
  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline" />

      <div className="animate-[fadeInUp_.6s_ease_.3s_forwards] opacity-0">
        {/* Header decoration */}
        <div className="flex items-center gap-4 mb-5 justify-center">
          <div className="h-px w-12 bg-linear-to-r from-transparent to-sky-400/30" />
          <span className="font-[Cinzel] text-[.6rem] tracking-[.25em] uppercase text-sky-400/50">
            Taulell de combat
          </span>
          <div className="h-px w-12 bg-linear-to-l from-transparent to-sky-400/30" />
        </div>

        {/* Board container */}
        <div className="bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-2xl backdrop-blur-xl p-5">
          {/* Column labels */}
          <div className="flex ml-[27px] mb-1.5">
            {COLS.map((c) => (
              <div
                key={c}
                className="font-[Cinzel] text-[10px] text-sky-400/40 text-center"
                style={{ width: 40 }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col gap-0.5">
            {ROWS.map((r) => (
              <div key={r} className="flex items-center gap-0.5">
                <div
                  className="font-[Cinzel] text-[10px] text-sky-400/40 text-right pr-1.5 flex-shrink-0"
                  style={{ width: 26 }}
                >
                  {r}
                </div>
                {COLS.map((c) => {
                  const coord = `${c}${r}`;
                  return (
                    <BoardCell
                      key={coord}
                      state={board[coord] ?? "empty"}
                      onClick={() => onCell(coord)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}