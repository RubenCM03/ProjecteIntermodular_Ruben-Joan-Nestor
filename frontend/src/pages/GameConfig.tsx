import { Link } from "react-router-dom";
import { useState } from "react";

import Logo from "../components/Logo"

const DEFAULT_SHIPS = [
    { id: "portaavions", name: "Portaavions", emoji: "🛳️", size: 5, count: 1 },
    { id: "cuirassat", name: "Cuirassat", emoji: "⚓", size: 4, count: 1 },
    { id: "creuer", name: "Creuer", emoji: "🚢", size: 3, count: 2 },
    { id: "vaixell4", name: "Submarí", emoji: "🤿", size: 2, count: 2 },
    { id: "vaixell5", name: "Destructor", emoji: "⛵", size: 1, count: 2 },
];

export default function GameConfig() {
    const [boardSize, setBoardSize] = useState(10);
    const [ships, setShips] = useState(DEFAULT_SHIPS);

    return (
        <div className="flex flex-col px-4 pb-16 pt-4">
            <Link to="/" className="fi-1 relative w-fit block">
                <Logo />
            </Link>

            <div className="fi-2 flex flex-col items-center mt-8 mb-8">
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-sky-400/40" />
                    <span className="text-sky-400/40 text-base">⚓</span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-sky-400/40" />
                </div>
                <h1 className="font-cinzel-deco text-sky-100 text-xl md:text-2xl tracking-wider">Configuració</h1>
                <p className="font-cinzel text-sky-400/40 text-xs tracking-[.2em] uppercase mt-1">Personalitza la partida</p>
            </div>

            <div className="fi-3 config-card max-w-lg w-full mx-auto p-6 flex flex-col gap-6">
                <div>
                    <p className="section-title mb-3">Tamany del taulell</p>
                    <div className="flex gap-2 flex-wrap">
                        {[10, 12].map(s => (
                            <button key={s} className={`opt-pill ${boardSize === s ? "active" : ""}`} onClick={() => setBoardSize(s)}>
                                {s}×{s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divider" />

                <div>
                    <p className="section-title mb-2">Vaixells</p>
                    <div className="flex flex-col">
                        {ships.map(ship => (
                            <div key={ship.id} className="ship-row flex items-center gap-3 py-2.5 px-2">
                                <span className="text-lg w-6 text-center">{ship.emoji}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-cinzel text-sky-200/75 text-xs tracking-wide truncate">{ship.name}</p>
                                    <div className="flex gap-1 mt-1.5">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div key={i} className={`ship-cell ${i < ship.size ? "filled" : ""}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="section-title" style={{ fontSize: ".58rem" }}>Mida</span>
                                    <div className="flex items-center gap-1">
                                        <button className="spin-btn" onClick={() => updateShip(ship.id, "size", -1)} disabled={ship.size <= 1}>−</button>
                                        <span className="font-cinzel text-sky-300 text-sm w-4 text-center">{ship.size}</span>
                                        <button className="spin-btn" onClick={() => updateShip(ship.id, "size", +1)} disabled={ship.size >= boardSize - 1}>+</button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="section-title" style={{ fontSize: ".58rem" }}>Quant.</span>
                                    <div className="flex items-center gap-1">
                                        <button className="spin-btn" onClick={() => updateShip(ship.id, "count", -1)} disabled={ship.count <= 0}>−</button>
                                        <span className="font-cinzel text-sky-300 text-sm w-4 text-center">{ship.count}</span>
                                        <button className="spin-btn" onClick={() => updateShip(ship.id, "count", +1)} disabled={ship.count >= 5}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container max-w-xl bg-white mx-auto p-5 rounded">
                <h1 className="text-center uppercase">Configuració de la partida</h1>
                {/* Configurar:

                    Tamany taulell
                    Quantitat vaixells
                    Canviar mida vaixells
                    Temps limit
                    Salvo mode (si el jugador ha trobat un vaixell pugui seguir el seu torn fins que trobi aigua)
                */}
                <div>

                </div>
            </div>
        </div>
    )
}