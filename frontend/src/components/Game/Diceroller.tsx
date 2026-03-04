import { useState } from "react";

type DiceFace = 1 | 2 | 3 | 4 | 5 | 6;

const FACES: DiceFace[] = [1, 2, 3, 4, 5, 6];

const ROTATIONS: Record<DiceFace, [number, number]> = {
  1: [0, 0],
  2: [0, 180],
  3: [0, -90],
  4: [0, 90],
  5: [-90, 0],
  6: [90, 0],
};

const DOT_COORDS: Record<DiceFace, [number, number][]> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 20], [72, 20], [28, 50], [72, 50], [28, 80], [72, 80]],
};

const FACE_TRANSFORMS: string[] = [
  "rotateY(0deg) translateZ(36px)",
  "rotateY(180deg) translateZ(36px)",
  "rotateY(90deg) translateZ(36px)",
  "rotateY(-90deg) translateZ(36px)",
  "rotateX(90deg) translateZ(36px)",
  "rotateX(-90deg) translateZ(36px)",
];

function DieFace({ n, transform }: { n: DiceFace; transform: string }) {
  return (
    <div style={{
      position: "absolute",
      width: 72, height: 72,
      transform,
      borderRadius: 10,
      background: "linear-gradient(145deg, #ffffff, #e8e8e8)",
      boxShadow: "inset 0 2px 4px rgba(255,255,255,.9), inset 0 -2px 6px rgba(0,0,0,.15), 0 0 0 1px rgba(0,0,0,.08)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      outline: "6px solid #ebebeb",
    }}>
      {DOT_COORDS[n].map(([l, t], idx) => (
        <div key={idx} style={{
          position: "absolute",
          width: "17%", height: "17%",
          left: `${l}%`, top: `${t}%`,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #444, #111)",
          boxShadow: "0 1px 3px rgba(0,0,0,.4)",
        }} />
      ))}
    </div>
  );
}

function Die({ rolling, transformStyle }: { rolling: boolean; transformStyle: string }) {
  return (
    <div style={{ width: 72, height: 72, perspective: 500 }}>
      <div style={{
        width: "100%", height: "100%",
        position: "relative",
        transformStyle: "preserve-3d",
        transition: rolling
          ? "transform 1.4s cubic-bezier(0.15, 0.9, 0.3, 1.05)"
          : "transform 0.4s ease-out",
        transform: transformStyle,
      }}>
        {FACES.map((n, i) => (
          <DieFace key={n} n={n} transform={FACE_TRANSFORMS[i]} />
        ))}
      </div>
    </div>
  );
}

export default function DiceRoller() {
  const [rolling, setRolling] = useState(false);
  const [rotation, setRotation] = useState([{ x: 0, y: 0 }, { x: 0, y: 0 }]);

  function roll() {
    if (rolling) return;
    setRolling(true);

    const r: DiceFace[] = [
      (Math.floor(Math.random() * 6) + 1) as DiceFace,
      (Math.floor(Math.random() * 6) + 1) as DiceFace,
    ];

    setRotation(prev => prev.map((curr, i) => {
      const [tx, ty] = ROTATIONS[r[i]];
      return {
        x: curr.x + (1080 + tx - (curr.x % 360)),
        y: curr.y + (1080 + ty - (curr.y % 360)),
      };
    }));

    setTimeout(() => setRolling(false), 1450);
  }

  return (
    <div className="inline-flex flex-col items-center gap-5 bg-slate-800 rounded-2xl px-8 py-6 border border-slate-700">
      <div className="flex gap-8 items-center h-20">
        <Die rolling={rolling} transformStyle={`rotateX(${rotation[0].x}deg) rotateY(${rotation[0].y}deg)`} />
        <div className="w-1 h-1 rounded-full bg-slate-600" />
        <Die rolling={rolling} transformStyle={`rotateX(${rotation[1].x}deg) rotateY(${rotation[1].y}deg)`} />
      </div>

      <button
        onClick={roll}
        disabled={rolling}
        className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500
          text-slate-200 text-sm font-medium tracking-wide transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {rolling ? "···" : "Tirar"}
      </button>
    </div>
  );
}