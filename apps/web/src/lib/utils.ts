import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export const PLATEAU_LGAS = [
  "Barkin Ladi",
  "Bassa",
  "Bokkos",
  "Jos East",
  "Jos North",
  "Jos South",
  "Kanam",
  "Kanke",
  "Langtang North",
  "Langtang South",
  "Mangu",
  "Mikang",
  "Pankshin",
  "Qua'an Pan",
  "Riyom",
  "Shendam",
  "Wase",
];

export const CROPS = [
  "Maize",
  "Rice",
  "Sorghum",
  "Millet",
  "Soybean",
  "Groundnut",
  "Tomato",
  "Pepper",
  "Onion",
  "Irish Potato",
  "Sweet Potato",
  "Yam",
  "Cassava",
  "Vegetables",
  "Other",
];

export const STORAGE_TYPES = [
  { value: "ambient", label: "Ambient" },
  { value: "cold", label: "Cold Storage" },
  { value: "silo", label: "Silo" },
  { value: "warehouse", label: "Warehouse" },
];

export const ROLES = {
  farmer: "Farmer",
  extension_officer: "Extension Officer",
  storage_operator: "Storage Operator",
  admin: "Admin",
  super_admin: "Super Admin",
} as const;

export type Role = keyof typeof ROLES;
