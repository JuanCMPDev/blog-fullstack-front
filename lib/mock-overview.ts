// Mock data for the Overview page
export interface DataEntry {
  name: string;
  entradas: number;
  usuarios: number;
}

export const data: DataEntry[] = [
  { name: "Ene", entradas: 40, usuarios: 24 },
  { name: "Feb", entradas: 30, usuarios: 13 },
  { name: "Mar", entradas: 20, usuarios: 98 },
  { name: "Abr", entradas: 27, usuarios: 39 },
  { name: "May", entradas: 18, usuarios: 48 },
  { name: "Jun", entradas: 23, usuarios: 38 },
  { name: "Jul", entradas: 34, usuarios: 43 },
];