import type { CellState, PlacedShip } from "../../types";
import { PanelTitle } from "./PanelTitle";

interface Props {
  ships: PlacedShip[];
  board: Record<string, CellState>;
}

function ShipRow({ ship }: { ship: PlacedShip }) {
  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-xl border transition-all duration-200 ${
        ship.found
          ? "border-sky-400/30 bg-sky-400/8"
          : "border-sky-400/8 bg-sky-400/3 hover:bg-sky-400/5"
      }`}
    >
      {/* Visual cells bar */}
      <div className="flex gap-0.5 flex-shrink-0">
        {Array.from({ length: ship.size }).map((_, i) => {
          const isHit = ship.hits.length > i;
          return (
            <div
              key={i}
              className="rounded-[3px] border transition-all"
              style={{
                width: 9,
                height: 9,
                background: ship.found
                  ? "rgba(56,189,248,.65)"
                  : isHit
                  ? "#ff6b35"
                  : "rgba(56,189,248,.12)",
                borderColor: ship.found
                  ? "rgba(56,189,248,.8)"
                  : isHit
                  ? "rgba(255,107,53,.6)"
                  : "rgba(56,189,248,.2)",
                boxShadow: ship.found
                  ? "0 0 5px rgba(56,189,248,.4)"
                  : isHit
                  ? "0 0 4px rgba(255,107,53,.5)"
                  : "none",
              }}
            />
          );
        })}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`font-[Cinzel] text-[.65rem] tracking-[.05em] truncate ${
            ship.found ? "text-sky-300" : "text-sky-100/70"
          }`}
        >
          {ship.name}
        </div>
        <div className="font-[Cinzel] text-[.55rem] tracking-[.1em] text-sky-400/40 mt-0.5">
          {ship.size} cel·les
        </div>
      </div>

      <span
        className={`font-[Cinzel] text-[.6rem] flex-shrink-0 ${
          ship.found
            ? "text-sky-400"
            : ship.hits.length > 0
            ? "text-orange-400"
            : "text-sky-400/30"
        }`}
      >
        {ship.found
          ? "✓"
          : ship.hits.length > 0
          ? `${ship.hits.length}/${ship.size}`
          : "···"}
      </span>
    </div>
  );
}

export default function FleetPanel({ ships, board }: Props) {
  const hits = Object.values(board).filter((s) => s === "hit").length;
  const misses = Object.values(board).filter((s) => s === "miss").length;
  const foundCount = ships.filter((s) => s.found).length;
  const progress = Math.round((foundCount / ships.length) * 100);

  const stats = [
    ["Encerts", hits],
    ["Fallades", misses],
    ["Trobats", foundCount],
    ["Restants", ships.length - foundCount],
  ] as const;

  return (
    <aside className="w-56 flex-shrink-0 border-r border-sky-400/10 bg-[rgba(3,15,30,0.5)] backdrop-blur-xl p-5 flex flex-col gap-5 overflow-y-auto">

      {/* Decorative header */}
      <div className="flex items-center gap-3 pt-1 animate-[fadeInUp_.6s_ease_.2s_forwards] opacity-0">
        <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/25" />
        <span className="text-sky-400/40 text-xs">⚓</span>
        <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/25" />
      </div>

      {/* Fleet list */}
      <div className="animate-[fadeInUp_.6s_ease_.3s_forwards] opacity-0">
        <PanelTitle>Flota</PanelTitle>
        <div className="flex flex-col gap-1.5">
          {ships.map((s) => (
            <ShipRow key={s.id} ship={s} />
          ))}
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

      {/* Stats grid */}
      <div className="animate-[fadeInUp_.6s_ease_.4s_forwards] opacity-0">
        <PanelTitle>Estadístiques</PanelTitle>
        <div className="grid grid-cols-2 gap-1.5">
          {stats.map(([label, num]) => (
            <div
              key={label}
              className="border border-sky-400/10 rounded-xl bg-[rgba(3,15,30,0.65)] py-3 text-center hover:border-sky-400/20 transition-colors"
            >
              <div className="font-[Cinzel_Decorative] text-2xl text-sky-300 leading-none">
                {num}
              </div>
              <div className="font-[Cinzel] text-[.55rem] tracking-[.2em] uppercase text-sky-400/45 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

      {/* Progress bar */}
      <div className="flex flex-col gap-2 animate-[fadeInUp_.6s_ease_.5s_forwards] opacity-0">
        <div className="flex justify-between">
          <span className="font-[Cinzel] text-[.6rem] tracking-[.15em] uppercase text-sky-400/45">
            Progrés
          </span>
          <span className="font-[Cinzel] text-[.6rem] text-sky-300/60">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-sky-400/8 border border-sky-400/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-sky-500/60 to-sky-300/80 transition-all duration-700"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 8px rgba(56,189,248,.4)",
            }}
          />
        </div>
      </div>
    </aside>
  );
}