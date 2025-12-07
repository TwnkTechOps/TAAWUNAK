export function localizeDigits(input: string, locale: string): string {
  if (!input) return "";
  const useArabicIndic = locale?.startsWith("ar");
  if (!useArabicIndic) return input;
  const map: Record<string, string> = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  };
  return input.replace(/[0-9]/g, (d) => map[d] ?? d);
}


