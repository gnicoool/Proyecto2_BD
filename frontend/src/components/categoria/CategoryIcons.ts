import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Baby,
  Battery,
  Beef,
  BookOpen,
  Cake,
  Car,
  Coffee,
  Cookie,
  CupSoda,
  Dog,
  Flower2,
  Home,
  Milk,
  Package,
  Pill,
  Snowflake,
  Sparkles,
  Tag,
  Trash2,
  Wheat,
  Wine,
} from "lucide-react";

function normalizeKey(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

const MAP: Record<string, LucideIcon> = {
  lacteos: Milk,
  panaderia: Cookie,
  bebidas: CupSoda,
  snacks: Cookie,
  conservas: Package,
  despensa: Wheat,
  limpieza: Sparkles,
  "higiene personal": Sparkles,
  congelados: Snowflake,
  "carnes frias": Beef,
  "frutas y verduras": Apple,
  especias: Package,
  cereales: Wheat,
  mascotas: Dog,
  bebes: Baby,
  "vinos y licores": Wine,
  "electro menores": Battery,
  papelaria: BookOpen,
  automotriz: Car,
  salud: Pill,
  "cafe y te": Coffee,
  reposteria: Cake,
  "platos desechables": Trash2,
  "textil hogar": Home,
  jardineria: Flower2,
};

export function getCategoryIcon(nombre: string): LucideIcon {
  const key = normalizeKey(nombre);
  return MAP[key] ?? Tag;
}
