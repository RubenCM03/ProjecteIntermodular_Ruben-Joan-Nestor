import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Game from "./Game"
import Logo from "../components/Logo"

const DEFAULT_SHIPS = [
    { id: 1, size: 2 },
    { id: 2, size: 3 },
    { id: 3, size: 4 },
    { id: 4, size: 5 },
];

const TIME_OPTIONS = [
    { label: "Sense límit", value: 0 },
    { label: "30 seg", value: 30 },
    { label: "1 min", value: 60 },
    { label: "2 min", value: 120 },
];

export default function GameConfig() {
    const navigate = useNavigate();
    const [boardSize, setBoardSize] = useState(10);
    const [ships, setShips] = useState(DEFAULT_SHIPS);
    const [timeLimit, setTimeLimit] = useState(0);
    const [salvoMode, setSalvoMode] = useState(false);

    const handleStartGame = () => {
    navigate("/game", {
        state: { boardSize, ships, timeLimit, salvoMode }
    });
};

    const updateShip = (id: string, field: "size" | "count", delta: number) => {
        setShips(prev => prev.map(s => {
            if (s.id !== id) return s;
            if (field === "size") return { ...s, size: Math.max(1, Math.min(boardSize - 1, s.size + delta)) };
            if (field === "count") return { ...s, count: Math.max(0, Math.min(5, s.count + delta)) };
            return s;
        }));
    };

    return (
        <div className="relative flex flex-col px-4 pb-16 pt-4">
            <Link to="/" className="absolute top-4 left-4 z-10">
                <Logo />
            </Link>

            <div className="flex flex-col items-center mt-8 mb-8 animate-[fadeInUp_.6s_ease_.25s_forwards] opacity-0">
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-sky-400/40" />
                    <span className="text-sky-400/40 text-base">⚓</span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-sky-400/40" />
                </div>
                <h1 className="font-[Cinzel_Decorative] text-sky-100 text-xl md:text-2xl tracking-wider">Configuració</h1>
                <p className="font-[Cinzel] text-sky-400/60 text-xs tracking-[.2em] uppercase mt-1">Personalitza la partida</p>
            </div>

            <div className="animate-[fadeInUp_.6s_ease_.4s_forwards] opacity-0 bg-[rgba(3,15,30,0.65)] border border-sky-400/10 rounded-2xl backdrop-blur-xl max-w-lg w-full mx-auto p-6 flex flex-col gap-6">
                <div>
                    <p className="font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase text-sky-300/45 mb-3">Tamany del taulell</p>
                    <div className="flex gap-2 flex-wrap">
                        {[10, 12].map(s => (
                            <button
                                key={s}
                                onClick={() => setBoardSize(s)}
                                className={`
                  ${boardSize === s
                                        ? "active-pill"
                                        : "pill"
                                    }`}
                            >
                                {s}×{s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase text-sky-300/45">
                            Vaixells ({ships.length}/6)
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setShips(prev => prev.length > 1 ? prev.slice(0, -1) : prev)}
                                disabled={ships.length <= 1}
                                className="w-[26px] h-[26px] rounded-md border border-sky-400/22 bg-sky-400/5 text-sky-300 text-[15px] flex items-center justify-center cursor-pointer transition-all hover:bg-sky-400/14 hover:border-sky-400/45 disabled:opacity-30 disabled:cursor-not-allowed"
                            >−</button>
                            <button
                                onClick={() => setShips(prev => prev.length < 6 ? [...prev, { id: Date.now(), size: 3 }] : prev)}
                                disabled={ships.length >= 6}
                                className="w-[26px] h-[26px] rounded-md border border-sky-400/22 bg-sky-400/5 text-sky-300 text-[15px] flex items-center justify-center cursor-pointer transition-all hover:bg-sky-400/14 hover:border-sky-400/45 disabled:opacity-30 disabled:cursor-not-allowed"
                            >+</button>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {ships.map((ship, i) => (
                            <div
                                key={ship.id}
                                className="flex items-center gap-3 py-2.5 px-2 rounded-lg border-b border-sky-400/6 last:border-b-0 hover:bg-sky-400/4 transition-colors duration-200"
                            >
                                <span className="font-[Cinzel] text-sky-300/45 text-[.65rem] tracking-[.15em] uppercase w-14 shrink-0">
                                    Vaixell {i + 1}
                                </span>

                                {/* Visual size bar */}
                                <div className="flex gap-1 flex-1">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <div
                                            key={j}
                                            className={`h-[11px] flex-1 rounded-[3px] border transition-all
                                ${j < ship.size - 1
                                                    ? "bg-sky-400/42 border-sky-400/65 shadow-[0_0_4px_rgba(56,189,248,.35)]"
                                                    : "bg-sky-400/8 border-sky-400/25"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Mida */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="font-[Cinzel] text-[.58rem] tracking-[.2em] uppercase text-sky-300/45">Mida</span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setShips(prev => prev.map(s => s.id === ship.id ? { ...s, size: Math.max(2, s.size - 1) } : s))}
                                            disabled={ship.size <= 2}
                                            className="w-[26px] h-[26px] rounded-md border border-sky-400/22 bg-sky-400/5 text-sky-300 text-[15px] flex items-center justify-center cursor-pointer transition-all hover:bg-sky-400/14 hover:border-sky-400/45 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >−</button>
                                        <span className="font-[Cinzel] text-sky-300 text-sm w-4 text-center">{ship.size}</span>
                                        <button
                                            onClick={() => setShips(prev => prev.map(s => s.id === ship.id ? { ...s, size: Math.min(5, s.size + 1) } : s))}
                                            disabled={ship.size >= 5}
                                            className="w-[26px] h-[26px] rounded-md border border-sky-400/22 bg-sky-400/5 text-sky-300 text-[15px] flex items-center justify-center cursor-pointer transition-all hover:bg-sky-400/14 hover:border-sky-400/45 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

                <div>
                    <p className="font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase text-sky-300/45 mb-3">Temps límit per torn</p>
                    <div className="flex gap-2 flex-wrap">
                        {TIME_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setTimeLimit(opt.value)}
                                className={`
                  ${timeLimit === opt.value
                                        ? "active-pill"
                                        : "pill"
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

                <div className="flex items-start gap-4 justify-between">
                    <div className="flex-1">
                        <p className="font-[Cinzel] text-[.65rem] tracking-[.2em] uppercase text-sky-300/45 mb-1">Mode Salva</p>
                        <p className="font-[Cinzel] text-sky-300/45 text-xs leading-relaxed">
                            Si el jugador enfonsa un vaixell, continua disparant fins que toca aigua.
                        </p>
                    </div>
                    <button
                        onClick={() => setSalvoMode(v => !v)}
                        aria-label="Activar mode salva"
                        className={`relative mt-1 w-[50px] h-[26px] rounded-full border flex-shrink-0 cursor-pointer transition-all duration-300
              ${salvoMode
                                ? "bg-sky-400/30 border-sky-400/55"
                                : "bg-sky-400/10 border-sky-400/20"
                            }`}
                    >
                        <span className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full transition-all duration-300
              ${salvoMode
                                ? "translate-x-6 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,.7)]"
                                : "bg-sky-400/45"
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="animate-[fadeInUp_.6s_ease_.4s_forwards] opacity-0 flex flex-col items-center mt-8 gap-4">
                <div className="flex gap-2 flex-wrap justify-center">
                    {[
                        `${boardSize}×${boardSize}`,
                        `${ships.length} vaixells`,
                        ...(timeLimit > 0 ? [`${timeLimit}s / torn`] : []),
                        ...(salvoMode ? [`Mode Salva`] : []),
                    ].map(label => (
                        <span key={label} className="active-pill cursor-auto">
                            {label}
                        </span>
                    ))}
                </div>

                <button onClick={handleStartGame} className="btn">
                    Iniciar partida
                </button>
            </div>
        </div>
    )
}