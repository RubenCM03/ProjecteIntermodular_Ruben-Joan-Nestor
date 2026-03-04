import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { register, saveToken } from '../services/authService'
import type { ApiError } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import '../styles/home.css'

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
            <div className="card">

                <h2 className="title-1">
                    Crear Compte
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div className="flex flex-col gap-1.5">
                        <label className="form-title">
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
                        {fieldError('email') && <span className="font-cinzel text-red-400/80 text-xs">{fieldError('email')}</span>}
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
                        {fieldError('password') && <span className="font-cinzel text-red-400/80 text-xs">{fieldError('password')}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="form-title">
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

                    {fieldError('general') && (
                        <div className="font-cinzel text-red-400/80 text-xs text-center border border-red-500/20 bg-red-500/5 rounded-lg px-4 py-3">
                            {fieldError('general')}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn"
                    >
                        {loading ? 'Registrant...' : 'Registrar-se'}
                    </button>

                </form>

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