export type Role = "admin" | "manager" | "sales" | "client";

export interface Profile {
  role:         Role;
  full_name:    string | null;
  avatar_url?:  string | null;
  email?:       string | null;
  university?:  string | null;
  birth_date?:  string | null;
  country?:     string | null;
  nationality?: string | null;
  client_type?: string | null;
}

/** Returns age from a birth_date string (YYYY-MM-DD), or null if unavailable. */
export function computeAge(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export const ROLE_META: Record<Role, { label: string; color: string; bg: string; border: string }> = {
  admin:   { label: "CEO / Admin", color: "#fcd34d", bg: "rgba(252,211,77,0.08)",  border: "rgba(252,211,77,0.2)"  },
  manager: { label: "Manager",     color: "#a855f7", bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)"  },
  sales:   { label: "Comercial",   color: "#D1FF48", bg: "rgba(209,255,72,0.08)", border: "rgba(209,255,72,0.2)"  },
  client:  { label: "Cliente",     color: "#00c0f3", bg: "rgba(0,192,243,0.08)",  border: "rgba(0,192,243,0.2)"   },
};

/** Alphabetically sorted list of countries (in Spanish) for select inputs. */
export const COUNTRIES: string[] = [
  "Afganistán", "Albania", "Alemania", "Algeria", "Angola", "Argentina", "Australia",
  "Austria", "Azerbaiyán", "Bangladés", "Bélgica", "Bolivia", "Bosnia y Herzegovina",
  "Brasil", "Bulgaria", "Camboya", "Camerún", "Canadá", "Chile", "China", "Colombia",
  "Congo", "Corea del Sur", "Costa Rica", "Croacia", "Cuba", "Dinamarca", "Ecuador",
  "Egipto", "El Salvador", "Emiratos Árabes Unidos", "Eslovaquia", "Eslovenia",
  "España", "Estados Unidos", "Etiopía", "Filipinas", "Finlandia", "Francia",
  "Ghana", "Gran Bretaña", "Grecia", "Guatemala", "Honduras", "Hungría", "India",
  "Indonesia", "Irak", "Irán", "Irlanda", "Israel", "Italia", "Jamaica", "Japón",
  "Jordania", "Kazajistán", "Kenia", "Líbano", "Libia", "Malasia", "Marruecos",
  "México", "Mozambique", "Nepal", "Nicaragua", "Nigeria", "Noruega", "Nueva Zelanda",
  "Países Bajos", "Pakistán", "Panamá", "Paraguay", "Perú", "Polonia", "Portugal",
  "Puerto Rico", "República Checa", "República Dominicana", "Rumania", "Rusia",
  "Arabia Saudita", "Senegal", "Serbia", "Singapur", "Sudáfrica", "Suecia", "Suiza",
  "Tanzania", "Tailandia", "Túnez", "Turquía", "Ucrania", "Uganda", "Uruguay",
  "Uzbekistán", "Venezuela", "Vietnam", "Yemen", "Zimbabue",
];
