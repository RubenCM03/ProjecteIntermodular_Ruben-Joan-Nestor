import '../styles/home.css'
import { Link } from "react-router-dom";
import Logo from "../components/Logo"
import { useAuth } from '../context/AuthContext'

export default function Home() {
    const { user } = useAuth()

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 text-center">

            <div className="fade-in-2 logo-float mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-2xl scale-150" />
                <Logo />
            </div>

            <p className="fade-in-3 font-cinzel text-sky-300/70 text-sm md:text-base uppercase mb-3">
                Troba la teva flota enfonsada al camp de batalla
            </p>

            <div className="fade-in-3 flex gap-3 mb-10 flex-wrap justify-center">
                {['1 Jugador', '10×10 / 12x12 Tauler', 'Torn a torn'].map((stat) => (
                    <span
                        key={stat}
                        className="pill cursor-auto"
                    >
                        {stat}
                    </span>
                ))}
            </div>

            <div className="fade-in-4">
                <Link
                    to={user ? "/game-config" : "/login"}
                    className="btn"
                >
                    <span className="items-center gap-3">
                        {user ? 'Jugar ara!' : 'Jugar ara!'}
                    </span>
                </Link>
            </div>

            <div className="fade-in-4 flex items-center gap-4 mt-12">
                <div className="h-px w-20 bg-linear-to-r from-transparent to-sky-400/70" />
                <div className="font-cinzel text-sky-500/70 text-xs uppercase">Bona sort, Capità</div>
                <div className="h-px w-20 bg-linear-to-l from-transparent to-sky-400/70" />
            </div>
        </div>
    )
}