import {
  Droplet,
  Flame,
  Zap,
  Wrench,
  MapPin,
  Bell,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Wallet,
  MessageCircle,
  Camera,
  LocateFixed,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Trade } from "../api/types";

export const TRADE_ICON: Record<Trade, LucideIcon> = {
  WATER: Droplet,
  GAS: Flame,
  ELECTRICITY: Zap,
};

export function TradeIcon({ trade, ...props }: { trade: Trade } & React.ComponentProps<LucideIcon>) {
  const Icon = TRADE_ICON[trade];
  return <Icon {...props} />;
}

const TRADE_CLASS: Record<Trade, string> = {
  WATER: "trade-badge-water",
  GAS: "trade-badge-gas",
  ELECTRICITY: "trade-badge-electricity",
};

// Tinted rounded badge used everywhere a trade needs a compact visual marker
// (list rows, headings, map "you are here" context) — icon-only, no emoji.
export function TradeBadge({ trade, size = 20 }: { trade: Trade; size?: number }) {
  const Icon = TRADE_ICON[trade];
  return (
    <span className={`trade-badge ${TRADE_CLASS[trade]}`}>
      <Icon size={size} strokeWidth={2} />
    </span>
  );
}

export {
  Droplet,
  Flame,
  Zap,
  Wrench,
  MapPin,
  Bell,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Wallet,
  MessageCircle,
  Camera,
  LocateFixed,
  X,
};

// --- Raw SVG markup for Leaflet map pins ---
// Leaflet's L.divIcon needs a plain HTML string, not React elements, so map
// markers reuse the same path data as the icons above but render to a
// hand-built <svg> string instead of going through react-dom/server.
const PIN_PATHS: Record<string, string[]> = {
  water: ["M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"],
  gas: ["M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"],
  electricity: [
    "M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",
  ],
  home: [
    "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
    "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  ],
  provider: [
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z",
  ],
  pin: ["M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"],
};

const PIN_EXTRA_SHAPES: Record<string, string> = {
  pin: '<circle cx="12" cy="10" r="3"/>',
};

export function RatingBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="muted">Nincs értékelés</span>;
  return (
    <span className="rating-badge">
      <Star size={13} strokeWidth={0} fill="currentColor" />
      {value.toFixed(1)}
    </span>
  );
}

export type MapPinIconKey = keyof typeof PIN_PATHS;

const TRADE_PIN_KEY: Record<Trade, MapPinIconKey> = {
  WATER: "water",
  GAS: "gas",
  ELECTRICITY: "electricity",
};

export function tradePinIcon(trade: Trade): MapPinIconKey {
  return TRADE_PIN_KEY[trade];
}

export function mapPinSvgMarkup(key: MapPinIconKey): string {
  const paths = PIN_PATHS[key].map((d) => `<path d="${d}"/>`).join("");
  const extra = PIN_EXTRA_SHAPES[key] ?? "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}${extra}</svg>`;
}
