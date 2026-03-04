import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, saveToken } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import type { ApiError } from '../services/authService'
import '../styles/home.css'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const { refresh } = useAuth()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await login(email, password)
            saveToken(res.access_token)
            await refresh()
            navigate('/')
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.message ?? 'Error inesperat')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6">

            <div className="card p-8">

                <h2 className="title-1">
                    Iniciar Sessió
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5">
                        <label className="form-title">
                            Correu electrònic
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="capitan@flota.com"
                            className="bg-sky-950/40 border border-sky-500/20 rounded-lg px-4 py-3 text-white placeholder:text-sky-400/30 focus:outline-none focus:border-sky-400/60 focus:bg-sky-950/60 transition-all duration-200 font-cinzel text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-title">
                            Contrasenya
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="bg-sky-950/40 border border-sky-500/20 rounded-lg px-4 py-3 text-white placeholder:text-sky-400/30 focus:outline-none focus:border-sky-400/60 focus:bg-sky-950/60 transition-all duration-200 font-cinzel text-sm"
                        />
                    </div>

                    {error && (
                        <div className="font-cinzel text-red-400/80 text-xs text-center border border-red-500/20 bg-red-500/5 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                    >
                        {loading ? 'Entrant...' : 'Entrar'}
                    </button>

                </form>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/30" />
                    <Link
                        to="/register"
                        className="font-cinzel text-sky-400/60 text-xs uppercase tracking-widest hover:text-sky-300/80 transition-colors duration-200"
                    >
                        Crear compte
                    </Link>
                    <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/30" />
                </div>

            </div>
        </div>
    )
}