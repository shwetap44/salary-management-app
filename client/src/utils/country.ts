export const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  AU: "Australia",
  CA: "Canada",
  SG: "Singapore",
  AE: "United Arab Emirates",
};

export function getCountryName(code: string): string {
  if (!code) return "";
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}
