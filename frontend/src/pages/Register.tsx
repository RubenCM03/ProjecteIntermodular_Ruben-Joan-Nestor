import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { register, saveToken } from '../services/authService'
import type { ApiError } from '../services/authService'
import '../styles/home.css'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [errors, setErrors] = useState<Record<string, string[]>>({})
    const [loading, setLoading] = useState(false)
    const { refresh } = useAuth()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})
        setLoading(true)

        try {
            const res = await register(name, email, password, passwordConfirmation)
            saveToken(res.access_token)
            await refresh()
            navigate('/')
        } catch (err) {
            const apiError = err as ApiError
            setErrors(apiError.errors ?? { general: [apiError.message] })
        } finally {
            setLoading(false)
        }
    }

    function fieldError(field: string): string | null {
        return errors[field]?.[0] ?? null
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 py-10">

            {/* Logo */}
            <div className="fade-in-2 logo-float mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-2xl scale-150" />
                <Logo />
            </div>

            {/* Card */}
            <div className="fade-in-3 w-full max-w-md rounded-2xl border border-sky-500/20 bg-sky-500/5 backdrop-blur-sm p-8">

                <h2 className="font-cinzel-deco text-white text-2xl text-center mb-8 tracking-wider">
                    Crear Compte
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Nom */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-cinzel text-sky-300/70 text-xs uppercase tracking-widest">
                            Nom
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="Capità Nemo"
                            className="bg-sky-950/40 border border-sky-500/20 rounded-lg px-4 py-3 text-white placeholder:text-sky-400/30 focus:outline-none focus:border-sky-400/60 focus:bg-sky-950/60 transition-all duration-200 font-cinzel text-sm"
                        />
                        {fieldError('name') && <span className="font-cinzel text-red-400/80 text-xs">{fieldError('name')}</span>}
                    </div>

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
                        {fieldError('email') && <span className="font-cinzel text-red-400/80 text-xs">{fieldError('email')}</span>}
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
                        {fieldError('password') && <span className="font-cinzel text-red-400/80 text-xs">{fieldError('password')}</span>}
                    </div>

                    {/* Confirmar password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="font-cinzel text-sky-300/70 text-xs uppercase tracking-widest">
                            Confirmar Contrasenya
                        </label>
                        <input
                            type="password"
                            value={passwordConfirmation}
                            onChange={e => setPasswordConfirmation(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="bg-sky-950/40 border border-sky-500/20 rounded-lg px-4 py-3 text-white placeholder:text-sky-400/30 focus:outline-none focus:border-sky-400/60 focus:bg-sky-950/60 transition-all duration-200 font-cinzel text-sm"
                        />
                    </div>

                    {/* Error general */}
                    {fieldError('general') && (
                        <div className="font-cinzel text-red-400/80 text-xs text-center border border-red-500/20 bg-red-500/5 rounded-lg px-4 py-3">
                            {fieldError('general')}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-glow mt-2 font-cinzel-deco text-white font-bold text-sm px-12 py-4 rounded-full border border-sky-400/50 bg-linear-to-b from-sky-600/40 to-sky-900/60 backdrop-blur-sm hover:from-sky-500/60 hover:to-sky-800/70 hover:border-sky-300/70 transition-all duration-300 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Registrant...' : 'Registrar-se'}
                    </button>

                </form>

                {/* Login link */}
                <div className="flex items-center gap-4 mt-8">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent to-sky-400/30" />
                    <Link
                        to="/login"
                        className="font-cinzel text-sky-400/60 text-xs uppercase tracking-widest hover:text-sky-300/80 transition-colors duration-200"
                    >
                        Ja tinc compte
                    </Link>
                    <div className="h-px flex-1 bg-linear-to-l from-transparent to-sky-400/30" />
                </div>

            </div>
        </div>
    )
}