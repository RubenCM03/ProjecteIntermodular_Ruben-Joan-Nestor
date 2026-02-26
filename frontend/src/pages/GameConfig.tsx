import { Link } from "react-router-dom";
import Logo from "../components/Logo"
export default function GameConfig() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] px-6">
            <Link to={"/"} className="fade-in-2 relative w-fit mt-4">
                <div className="absolute inset-0 rounded-full scale-150" />
                <Logo />
            </Link>


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