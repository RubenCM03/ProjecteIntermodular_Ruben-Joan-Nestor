import '../styles/home.css'
import { Link } from "react-router-dom";
import Logo from "../components/Logo"
import { useAuth } from '../context/AuthContext'

export default function Home() {
    const { user } = useAuth()

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center">

            {/* Logo */}
            <div className="fade-in-2 logo-float mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-2xl scale-150" />
                <Logo />
            </div>

            {/* Tagline */}
            <p className="fade-in-3 font-cinzel text-sky-300/70 text-sm md:text-base uppercase mb-3">
                Troba la teva flota enfonsada al camp de batalla
            </p>

            {/* Stat pills */}
            <div className="fade-in-3 flex gap-3 mb-10 flex-wrap justify-center">
                {['1 Jugador', '10×10 Tauler', 'Torn a torn'].map((stat) => (
                    <span
                        key={stat}
                        className="font-cinzel text-xs tracking-widest uppercase px-4 py-1.5 rounded-full border border-sky-500/25 bg-sky-500/5 text-sky-300/70"
                    >
                        {stat}
                    </span>
                ))}
            </div>

            {/* CTA Button */}
            <div className="fade-in-4">
                <Link
                    to={user ? "/game-config" : "/register"}
                    className="btn"
                >
                    <span className="items-center gap-3">
                        {user ? 'Jugar ara!' : 'Jugar ara!'}
                    </span>
                </Link>
            </div>

            {/* Bottom decorative rule */}
            <div className="fade-in-4 flex items-center gap-4 mt-12">
                <div className="h-px w-20 bg-linear-to-r from-transparent to-sky-400/70" />
                <div className="font-cinzel text-sky-500/70 text-xs uppercase">Bona sort, Capità</div>
                <div className="h-px w-20 bg-linear-to-l from-transparent to-sky-400/70" />
            </div>
        </div>
    )
}