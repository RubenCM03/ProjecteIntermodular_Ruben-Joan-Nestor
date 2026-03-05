import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { statsApi } from '../../api'
import type { RankingEntry } from '../../api'
import { useAuth } from '../../context/AuthContext'
import { PanelTitle } from './PanelTitle'

interface Props {
    shotsUsed: number
    timeStr: string
    onPlayAgain: () => void
    onClose: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function VictoryOverlay({ shotsUsed, timeStr, onPlayAgain, onClose }: Props) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [ranking, setRanking] = useState<RankingEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        statsApi.ranking()
            .then(res => setRanking(res.ranking))
            .catch(() => setError(true))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center">

            <div
                className="absolute inset-0 bg-[rgba(2,8,16,0.85)] backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-sky-400/20 bg-[rgba(3,15,30,0.95)] backdrop-blur-xl p-6 flex flex-col gap-5 animate-[fadeInUp_.5s_ease_forwards]">

                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/25" />
                    <span className="font-[Cinzel] text-[.55rem] tracking-[.25em] uppercase text-sky-400/40">
                        Victòria
                    </span>
                    <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/25" />
                </div>

                <div className="text-center flex flex-col gap-1.5">
                    <div
                        className="font-[Cinzel_Decorative] text-2xl text-sky-300 tracking-wider"
                        style={{ textShadow: '0 0 30px rgba(56,189,248,.5)' }}
                    >
                        Flota Trobada!
                    </div>
                    <p className="font-[Cinzel] text-[.6rem] tracking-[.15em] uppercase text-sky-400/50">
                        Has completat la missió, Capità
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                    {[
                        ['Dispars', shotsUsed],
                        ['Temps', timeStr],
                    ].map(([label, val]) => (
                        <div
                            key={label}
                            className="border border-sky-400/10 rounded-xl bg-[rgba(3,15,30,0.65)] py-3 text-center"
                        >
                            <div
                                className="font-[Cinzel_Decorative] text-xl text-sky-300 leading-none"
                                style={{ textShadow: '0 0 12px rgba(56,189,248,.3)' }}
                            >
                                {val}
                            </div>
                            <div className="font-[Cinzel] text-[.5rem] tracking-[.2em] uppercase text-sky-400/40 mt-1">
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

                <div>
                    <PanelTitle>Rànquing Global</PanelTitle>

                    <div className="flex flex-col gap-1">
                        {loading && (
                            <>
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="h-9 rounded-xl bg-sky-400/5 border border-sky-400/8 animate-pulse"
                                    />
                                ))}
                            </>
                        )}

                        {error && (
                            <p className="font-[Cinzel] text-[.6rem] tracking-[.1em] text-red-400/50 text-center py-2">
                                No s'ha pogut carregar el rànquing
                            </p>
                        )}

                        {!loading && !error && ranking.length === 0 && (
                            <p className="font-[Cinzel] text-[.6rem] tracking-[.1em] text-sky-400/30 text-center py-2">
                                Encara no hi ha dades
                            </p>
                        )}

                        {!loading && !error && ranking.map((entry, i) => {
                            const isMe = entry.name === user?.name
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-200
                                        ${isMe
                                            ? 'border-sky-400/30 bg-sky-400/8'
                                            : 'border-sky-400/8 bg-transparent'
                                        }`}
                                >
                                    <span className="w-5 text-center text-sm flex-shrink-0">
                                        {i < 3
                                            ? MEDALS[i]
                                            : <span className="font-[Cinzel] text-[.55rem] text-sky-400/35">{i + 1}</span>
                                        }
                                    </span>
                                    <span className={`font-[Cinzel] text-[.6rem] tracking-[.05em] flex-1 truncate
                                        ${isMe ? 'text-sky-300' : 'text-sky-100/60'}`}
                                    >
                                        {entry.name}
                                        {isMe && <span className="ml-1.5 text-sky-400/40">← tu</span>}
                                    </span>
                                    <span className="font-[Cinzel] text-[.55rem] text-sky-400/45 flex-shrink-0">
                                        {entry.won_games}V
                                    </span>
                                    <span className="font-[Cinzel] text-[.6rem] text-sky-300/60 flex-shrink-0 w-10 text-right">
                                        {entry.best_score}🎯
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent" />

                <div className="flex gap-2">
                    
                    <button
                        onClick={onPlayAgain}
                        className="py-2.5 px-3 rounded-xl border border-sky-400/8 bg-transparent text-sky-400/40 font-[Cinzel] text-[.6rem] tracking-[.2em] uppercase hover:bg-sky-400/5 hover:text-sky-400/60 transition-all duration-200 cursor-pointer"
                    >
                        Nova partida
                    </button>
                </div>

            </div>
        </div>
    )
}