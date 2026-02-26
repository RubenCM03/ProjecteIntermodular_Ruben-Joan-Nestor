import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import GameConfig from "./pages/GameConfig"

const BUBBLES = [
  { w: 8, l: '8%', dur: '9s', del: '0s' },
  { w: 5, l: '18%', dur: '12s', del: '2s' },
  { w: 10, l: '32%', dur: '8s', del: '4.5s' },
  { w: 4, l: '47%', dur: '11s', del: '1s' },
  { w: 7, l: '61%', dur: '9s', del: '3s' },
  { w: 6, l: '74%', dur: '13s', del: '0.5s' },
  { w: 9, l: '87%', dur: '10s', del: '5s' },
  { w: 5, l: '94%', dur: '8s', del: '7s' },
]

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030b17]">

      {/* Ocean depth gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#020810] via-[#04101f] to-[#061828]" />

      {/* Radial depth glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-cyan-950/20 rounded-full blur-3xl" />
      </div>

      {/* Naval chart grid */}
      <div className="grid-overlay absolute inset-0" />

      {/* Sonar scan line */}
      <div className="sonar-line" />

      {/* Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="bubble absolute bottom-0 border border-sky-400/20"
            style={{
              width: b.w, height: b.w, left: b.l,
              animationDuration: b.dur, animationDelay: b.del,
              background: 'radial-gradient(circle at 30% 30%, rgba(125,211,252,0.3), rgba(14,116,144,0.1))',
            }}
          />
        ))}
      </div>


      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game-config" element={<GameConfig />} />
          </Routes>
        </main>
      </div>

    </div>
  )
}

export default App