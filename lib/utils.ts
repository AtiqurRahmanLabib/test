
export interface Product {
  id: number;
  slug: string;
  nameBn: string;
  category: string;
  categoryNameBn: string;
  categoryIcon: string;
  unit: string;
  image: string;
  today: number;
  yesterday: number;
  lastWeek: number;
  lastMonth: number;
  change: {
    dir: "up" | "down" | "flat";
    pct: number;
  };
  markets: {
    market: string;
    division: string;
    min: number;
    max: number;
  }[];
}

export interface Category {
  id: string;
  slug: string;
  nameBn: string;
  icon: string;
}

const bengaliDigits = [
  "০", "১", "২", "৩", "৪",
  "৫", "৬", "৭", "৮", "৯",
];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/[0-9]/g, (digit) => {
    return bengaliDigits[Number(digit)];
  });
}

export function formatPrice(price: number): string {
  return toBengaliNumber(
    price.toLocaleString("en-IN")
  );
}

export function getUnitBn(unit: string): string {
  const units: Record<string, string> = {
    kg: "প্রতি কেজি",
    litre: "প্রতি লিটার",
    liter: "প্রতি লিটার",
    piece: "প্রতি পিস",
    pcs: "প্রতি পিস",
    dozen: "প্রতি ডজন",
    gram: "প্রতি গ্রাম",
    packet: "প্রতি প্যাকেট",
  };

  return units[unit.toLowerCase()] || `প্রতি ${unit}`;
}

export function getBanglaDate(): string {
  const now = new Date();

  const days = [
    "রবিবার",
    "সোমবার",
    "মঙ্গলবার",
    "বুধবার",
    "বৃহস্পতিবার",
    "শুক্রবার",
    "শনিবার",
  ];

  const months = [
    "জানুয়ারি",
    "ফেব্রুয়ারি",
    "মার্চ",
    "এপ্রিল",
    "মে",
    "জুন",
    "জুলাই",
    "আগস্ট",
    "সেপ্টেম্বর",
    "অক্টোবর",
    "নভেম্বর",
    "ডিসেম্বর",
  ];

  return `${days[now.getDay()]}, ${toBengaliNumber(
    now.getDate()
  )} ${months[now.getMonth()]}, ${toBengaliNumber(
    now.getFullYear()
  )}`;
}
