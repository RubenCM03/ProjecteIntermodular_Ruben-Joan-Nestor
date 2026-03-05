import { useEffect, useState } from 'react'
import { statsApi } from '../api'
import type { RankingEntry } from '../api'
import { useAuth } from '../context/AuthContext'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Ranking() {
    const { user } = useAuth()
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
        <div className="flex flex-col items-center px-4 pb-20">
            <div className="flex flex-col items-center mt-8 mb-8 animate-[fadeInUp_.6s_ease_.25s_forwards] opacity-0">
                <div className="flex items-center gap-4 mb-3">
                    <div className="h-px w-16 bg-linear-to-r from-transparent to-sky-400/40" />
                    <span className="text-sky-400/40 text-base">🏆</span>
                    <div className="h-px w-16 bg-linear-to-l from-transparent to-sky-400/40" />
                </div>
                <h1 className="title-1">Rànquing Global</h1>
                <p className="font-[Cinzel] text-sky-400/60 text-xs tracking-[.2em] uppercase mt-1">Els millors capitans</p>
            </div>

            <div className="card w-full max-w-lg animate-[fadeInUp_.6s_ease_.4s_forwards] opacity-0">
                {loading && (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 rounded-xl bg-sky-400/5 border border-sky-400/8 animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <p className="font-[Cinzel] text-[.65rem] tracking-[.15em] text-red-400/50 text-center py-6">
                        No s'ha pogut carregar el rànquing
                    </p>
                )}

                {!loading && !error && ranking.length === 0 && (
                    <p className="font-[Cinzel] text-[.65rem] tracking-[.15em] text-sky-400/30 text-center py-6">
                        Encara no hi ha dades
                    </p>
                )}

                {!loading && !error && ranking.length > 0 && (
                    <>
                        <div className="flex items-center gap-2.5 px-3 pb-2 mb-1">
                            <span className="w-5" />
                            <span className="font-[Cinzel] text-[.5rem] tracking-[.2em] uppercase text-sky-400/30 flex-1">Jugador</span>
                            <span className="font-[Cinzel] text-[.5rem] tracking-[.2em] uppercase text-sky-400/30 w-6 text-center">V</span>
                            <span className="font-[Cinzel] text-[.5rem] tracking-[.2em] uppercase text-sky-400/30 w-14 text-center">Partides</span>
                            <span className="font-[Cinzel] text-[.5rem] tracking-[.2em] uppercase text-sky-400/30 w-10 text-right">Millor
                            </span>
                        </div>

                        <div className="h-px bg-linear-to-r from-transparent via-sky-400/12 to-transparent mb-2" />

                        <div className="flex flex-col gap-1.5">
                            {ranking.map((entry, i) => {
                                const isMe = entry.name === user?.name
                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-2.5 px-3 py-3 rounded-xl border transition-all duration-200
                                            ${isMe
                                                ? 'border-sky-400/30 bg-sky-400/8 shadow-[0_0_15px_rgba(56,189,248,.05)]'
                                                : 'border-sky-400/8 bg-sky-400/3 hover:bg-sky-400/5'
                                            }`}
                                    >
                                        <span className="w-5 text-center text-sm flex-shrink-0">
                                            {i < 3
                                                ? MEDALS[i]
                                                : <span className="font-[Cinzel] text-[.55rem] text-sky-400/35">{i + 1}</span>
                                            }
                                        </span>
                                        <span className={`font-[Cinzel] text-[.65rem] tracking-[.05em] flex-1 truncate
                                            ${isMe ? 'text-sky-300' : 'text-sky-100/60'}`}>
                                            {entry.name}
                                            {isMe && <span className="ml-1.5 text-sky-400/40">← tu</span>}
                                        </span>
                                        <span className="font-[Cinzel] text-[.65rem] text-green-400/70 w-6 text-center flex-shrink-0">
                                            {entry.won_games}
                                        </span>
                                        <span className="font-[Cinzel] text-[.6rem] text-sky-400/40 w-14 text-center flex-shrink-0">
                                            {entry.total_games}
                                        </span>
                                        <span className="font-[Cinzel] text-[.65rem] text-sky-300/60 w-10 text-right flex-shrink-0">
                                            {entry.best_score ?? '—'}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}