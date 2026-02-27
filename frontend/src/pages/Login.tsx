import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { login, saveToken } from '../services/authService'
import type { ApiError } from '../services/authService'
import '../styles/home.css'
import { useAuth } from '../context/AuthContext'

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

            {/* Logo */}
            <div className="fade-in-2 logo-float mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-2xl scale-150" />
                <Logo />
            </div>

            {/* Card */}
            <div className="fade-in-3 w-full max-w-md rounded-2xl border border-sky-500/20 bg-sky-500/5 backdrop-blur-sm p-8">

                <h2 className="font-cinzel-deco text-white text-2xl text-center mb-8 tracking-wider">
                    Iniciar Sessió
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-cinzel text-sky-300/70 text-xs uppercase tracking-widest">
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

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-cinzel text-sky-300/70 text-xs uppercase tracking-widest">
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

                    {/* Error */}
                    {error && (
                        <div className="font-cinzel text-red-400/80 text-xs text-center border border-red-500/20 bg-red-500/5 rounded-lg px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                    >
                        {loading ? 'Entrant...' : 'Entrar'}
                    </button>

                </form>

                {/* Register link */}
                <div className="flex items-center gap-4 mt-8">
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