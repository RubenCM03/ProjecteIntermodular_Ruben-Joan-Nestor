import { useNavigate } from "react-router-dom";
import { useState } from "react";

const DEFAULT_SHIPS = [
    { id: 1, size: 5 },
    { id: 2, size: 4 },
    { id: 3, size: 3 },
    { id: 4, size: 3 },
    { id: 5, size: 2 },
];

const SHOTS_OPTIONS = [
    { label: "Auto", value: 0 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
    { label: "60", value: 60 },
];

export default function GameConfig() {
    const navigate = useNavigate();
    const [boardSize, setBoardSize] = useState(10);
    const [ships, setShips] = useState(DEFAULT_SHIPS);
    const [maxShots, setMaxShots] = useState(0);
    const [salvoMode, setSalvoMode] = useState(false);

    const handleStartGame = () => {
        navigate("/game", {
            state: { boardSize, ships, maxShots, salvoMode }
        });
    };

    return (
        <div className="relative flex flex-col px-4 pb-20">
            <div className="flex flex-col items-center mt-8 mb-8 animate-[fadeInUp_.6s_ease_.25s_forwards] opacity-0">
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-sky-400/40" />
                    <span className="text-sky-400/40 text-base">⚓</span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-sky-400/40" />
                </div>
                <h1 className="title-1">Configuració</h1>
                <p className="font-[Cinzel] text-sky-400/60 text-xs tracking-[.2em] uppercase mt-1">Personalitza la partida</p>
            </div>

            <div className="card">
                <div>
                    <p className="form-title">Tamany del taulell</p>
                    <div className="flex gap-2 flex-wrap">
                        {[10, 12].map(s => (
                            <button key={s} onClick={() => setBoardSize(s)}
                                className={`${boardSize === s ? "active-pill" : "pill"}`}>
                                {s}×{s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="separator-line" />

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="form-title">Vaixells ({ships.length}/6)</p>
                        <div className="flex gap-1">
                            <button onClick={() => setShips(prev => prev.length > 1 ? prev.slice(0, -1) : prev)}
                                disabled={ships.length <= 1} className="small-btn">−</button>
                            <button onClick={() => setShips(prev => prev.length < 6 ? [...prev, { id: Date.now(), size: 3 }] : prev)}
                                disabled={ships.length >= 6} className="small-btn">+</button>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        {ships.map((ship, i) => (
                            <div key={ship.id}
                                className="flex items-center gap-3 py-2.5 px-2 rounded-lg border-b border-sky-400/6 last:border-b-0 hover:bg-sky-400/4 transition-colors duration-200">
                                <span className="font-[Cinzel] text-sky-300/45 text-[.65rem] tracking-[.15em] uppercase w-auto shrink-0">
                                    Vaixell {i + 1}
                                </span>
                                <div className="flex gap-1 flex-1">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className={`${j < ship.size - 1 ? "config-bar" : "config-bar-active"}`} />
                                    ))}
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="font-[Cinzel] text-[.58rem] tracking-[.2em] uppercase text-sky-300/45">Mida</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setShips(prev => prev.map(s => s.id === ship.id ? { ...s, size: Math.max(2, s.size - 1) } : s))}
                                            disabled={ship.size <= 2} className="small-btn">−</button>
                                        <span className="font-[Cinzel] text-sky-300 text-sm w-4 text-center">{ship.size}</span>
                                        <button onClick={() => setShips(prev => prev.map(s => s.id === ship.id ? { ...s, size: Math.min(5, s.size + 1) } : s))}
                                            disabled={ship.size >= 5} className="small-btn">+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="separator-line" />

                <div>
                    <p className="form-title">Intents màxims</p>
                    <p className="font-[Cinzel] text-sky-300/45 text-xs mb-3">
                        Auto calcula els intents segons els vaixells. O tria un número fix.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        {SHOTS_OPTIONS.map(opt => (
                            <button key={opt.value} onClick={() => setMaxShots(opt.value)}
                                className={`${maxShots === opt.value ? "active-pill" : "pill"}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    {maxShots > 0 && (
                        <div className="flex items-center gap-3 mt-3">
                            <button onClick={() => setMaxShots(v => Math.max(10, v - 5))} className="small-btn">−</button>
                            <span className="font-[Cinzel] text-sky-300 text-sm w-8 text-center">{maxShots}</span>
                            <button onClick={() => setMaxShots(v => Math.min(200, v + 5))} className="small-btn">+</button>
                            <span className="font-[Cinzel] text-sky-400/40 text-[.6rem] tracking-[.1em] uppercase">torns</span>
                        </div>
                    )}
                </div>

            </div>

            <div className="animate-[fadeInUp_.6s_ease_.4s_forwards] opacity-0 flex flex-col items-center mt-8 gap-4">
                <div className="flex gap-2 flex-wrap justify-center">
                    {[
                        `${boardSize}×${boardSize}`,
                        `${ships.length} vaixells`,
                        maxShots > 0 ? `${maxShots} dispars` : "Dispars auto",
                        ...(salvoMode ? ["Mode Salva"] : []),
                    ].map(label => (
                        <span key={label} className="active-pill cursor-auto">{label}</span>
                    ))}
                </div>
                <button onClick={handleStartGame} className="btn">Iniciar partida</button>
            </div>
        </div>
    )
}