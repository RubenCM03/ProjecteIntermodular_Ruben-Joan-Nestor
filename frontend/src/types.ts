export type CellState = "empty" | "miss" | "hit" | "found";
export type DiceFace  = 1 | 2 | 3 | 4 | 5 | 6;

export interface ShipDef {
  id:   number;
  name: string;
  size: number;
}

export interface PlacedShip extends ShipDef {
  cells: string[];  
  hits:  string[];
  found: boolean;
}

export interface LogEntry {
  id:   number;
  type: "miss" | "hit" | "found";
  text: string;
}

export const COLS          = ["A","B","C","D","E","F","G","H","I","J"] as const;
export const ROWS          = [1,2,3,4,5,6,7,8,9,10] as const;
export const MAX_ATTEMPTS  = 50;

export const SHIP_DEFS: ShipDef[] = [
  { id:1, name:"Patrullera",  size:2 },
  { id:2, name:"Submarí",     size:3 },
  { id:3, name:"Destructor",  size:3 },
  { id:4, name:"Cuirassat",   size:4 },
  { id:5, name:"Portaavions", size:5 },
];

export const DOT_COORDS: Record<DiceFace, [number,number][]> = {
  1:[[50,50]],
  2:[[28,28],[72,72]],
  3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]],
  5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,20],[72,20],[28,50],[72,50],[28,80],[72,80]],
};

export function placeShips(): PlacedShip[] {
  const occupied = new Set<string>();
  const placed: PlacedShip[] = [];

  for (const def of SHIP_DEFS) {
    let cells: string[] = [];
    let tries = 0;

    while (cells.length === 0 && tries < 200) {
      tries++;
      const horizontal = Math.random() < 0.5;
      const colIdx = Math.floor(Math.random() * (horizontal ? 10 - def.size + 1 : 10));
      const rowIdx = Math.floor(Math.random() * (horizontal ? 10 : 10 - def.size + 1));

      const candidate: string[] = [];
      for (let i = 0; i < def.size; i++) {
        const c = COLS[horizontal ? colIdx + i : colIdx];
        const r = horizontal ? rowIdx + 1 : rowIdx + 1 + i;
        candidate.push(`${c}${r}`);
      }

      if (candidate.every(coord => !occupied.has(coord))) {
        cells = candidate;
      }
    }

    cells.forEach(c => occupied.add(c));
    placed.push({ ...def, cells, hits: [], found: false });
  }

  return placed;
}