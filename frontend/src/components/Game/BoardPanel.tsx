import { useState } from "react";
import type { CellState, PlacedShip } from "../../types";

interface Props {
  board: Record<string, CellState>;
  onCell: (coord: string) => void;
  lastSunkShip: PlacedShip | null;
  onCloseSunk: () => void;
  boardSize: number;
}

const SHIP_SVG: Record<string, string> = {
  "Portaavions": "/carrier_dark.svg",
  "Cuirassat": "/battleship_dark.svg",
  "Destructor": "/destroyer_dark.svg",
  "Submarí": "/submarine_dark.svg",
  "Patrullera": "/cruiser_dark.svg",
};

function BoardCell({
  state,
  onClick,
  cellPx,
}: {
  state: CellState;
  onClick: () => void;
  cellPx: number;
}) {
  const [ripple, setRipple] = useState(false);

  const cls: Record<CellState, string> = {
    empty: "bg-[rgba(3,15,30,0.55)] border-sky-400/10 cursor-pointer hover:bg-sky-400/10 hover:border-sky-400/40 hover:scale-105",
    miss: "bg-sky-900/20 border-sky-400/15 cursor-default",
    hit: "bg-yellow-400/15 border-yellow-400/50 cursor-default",
    found: "bg-green-400/15 border-green-400/50 cursor-default",
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
      style={{ width: cellPx, height: cellPx }}
    >
      {ripple && <div className="cell-ripple" />}
      {state === "miss" && (
        <span className="text-sky-400/40 leading-none" style={{ fontSize: cellPx * 0.45 }}>·</span>
      )}
      {state === "hit" && (
        <span style={{ color: "#facc15", fontSize: cellPx * 0.32, textShadow: "0 0 8px #facc15" }}>✕</span>
      )}
      {state === "found" && (
        <span className="text-green-400" style={{ fontSize: cellPx * 0.28, textShadow: "0 0 10px rgba(74,222,128,.8)" }}>◆</span>
      )}
    </div>
  );
}

function SunkShipPopup({ ship, onClose }: { ship: PlacedShip; onClose: () => void }) {
  const svgSrc = SHIP_SVG[ship.name];

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(3,15,30,0.5)] backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 px-10 py-7 rounded-2xl border border-sky-400/30 bg-[rgba(3,15,30,0.95)] backdrop-blur-xl shadow-[0_0_50px_rgba(56,189,248,.15)] animate-[fadeInUp_.4s_ease_forwards]">
        <div className="flex items-center gap-4">
          <div className="h-px w-10 bg-linear-to-r from-transparent to-sky-400/30" />
          <span className="text-sky-400/50 text-sm">⚓</span>
          <div className="h-px w-10 bg-linear-to-l from-transparent to-sky-400/30" />
        </div>

        {svgSrc && (
          <img
            src={svgSrc}
            alt={ship.name}
            style={{
              width: 180,
              height: 70,
              objectFit: "contain",
              filter: "brightness(0) saturate(100%) invert(70%) sepia(80%) saturate(400%) hue-rotate(170deg) brightness(110%)",
            }}
          />
        )}

        <div className="text-center">
          <p
            className="font-[Cinzel_Decorative] text-sky-300 text-base tracking-wider"
            style={{ textShadow: "0 0 20px rgba(56,189,248,.4)" }}
          >
            {ship.name}
          </p>
          <p className="font-[Cinzel] text-sky-400/50 text-[.6rem] tracking-[.25em] uppercase mt-1">
            Salvat!
          </p>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-sky-400/15 to-transparent" />

        <button
          onClick={onClose}
          className="font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase text-sky-400/50 hover:text-sky-300 border border-sky-400/20 hover:border-sky-400/50 px-5 py-2 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}

export default function BoardPanel({ board, onCell, lastSunkShip, onCloseSunk, boardSize }: Props) {
  const cellPx = boardSize <= 10 ? 40 : 32;
  const rowLabelW = cellPx - 8;

  const cols = Array.from({ length: boardSize }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const rows = Array.from({ length: boardSize }, (_, i) => i + 1);

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline" />

      <div className="animate-[fadeInUp_.6s_ease_.3s_forwards] opacity-0 relative">
        <div className="flex items-center gap-4 mb-5 justify-center">
          <div className="h-px w-12 bg-linear-to-r from-transparent to-sky-400/30" />
          <span className="font-[Cinzel] text-[.6rem] tracking-[.25em] uppercase text-sky-400/50">
            Taulell de joc
          </span>
          <div className="h-px w-12 bg-linear-to-l from-transparent to-sky-400/30" />
        </div>

        <div className="bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-2xl backdrop-blur-xl p-5 relative">
          {lastSunkShip && (
            <SunkShipPopup ship={lastSunkShip} onClose={onCloseSunk} />
          )}

          <div className="flex mb-1.5" style={{ marginLeft: rowLabelW + 2 }}>
            {cols.map((c) => (
              <div
                key={c}
                className="font-[Cinzel] text-[10px] text-sky-400/40 text-center"
                style={{ width: cellPx }}
              >
                {c}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0.5">
            {rows.map((r) => (
              <div key={r} className="flex items-center gap-0.5">
                <div
                  className="font-[Cinzel] text-[10px] text-sky-400/40 text-right pr-1.5 flex-shrink-0"
                  style={{ width: rowLabelW }}
                >
                  {r}
                </div>
                {cols.map((c) => {
                  const coord = `${c}${r}`;
                  return (
                    <BoardCell
                      key={coord}
                      state={board[coord] ?? "empty"}
                      onClick={() => onCell(coord)}
                      cellPx={cellPx}
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