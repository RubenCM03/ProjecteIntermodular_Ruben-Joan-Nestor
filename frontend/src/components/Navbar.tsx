import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout } from '../services/authService'
import '../styles/home.css'

export default function Navbar() {
    const { user, loading, logoutUser } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        logoutUser()
        navigate('/')
    }

    return (
        <nav className="relative z-20 flex items-center justify-between px-6 pt-5">

            {/* Logo text */}
            <Link
                to="/"
                className="font-cinzel-deco text-sky-300/80 text-sm tracking-widest uppercase hover:text-sky-200 transition-colors duration-200"
            >
                Trobar la Flota
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {loading ? (
                    <div className="w-20 h-4 rounded-full bg-sky-500/10 animate-pulse" />
                ) : user ? (
                    <>
                        {/* Username */}
                        <span className="font-cinzel text-sky-300/50 text-xs uppercase tracking-widest hidden sm:block">
                            {user.name}
                        </span>

                        {/* Divider */}
                        <div className="h-4 w-px bg-sky-500/20" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="font-cinzel text-sky-400/60 text-xs uppercase tracking-widest hover:text-red-400/70 transition-colors duration-200 cursor-pointer"
                        >
                            Sortir
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="font-cinzel text-sky-400/70 text-xs uppercase tracking-widest hover:text-sky-300/80 transition-colors duration-200"
                        >
                            Login
                        </Link>
                        <div className="h-4 w-px bg-sky-500/20" />
                        <Link
                            to="/register"
                            className="pill"
                        >
                            Registrar-se
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}