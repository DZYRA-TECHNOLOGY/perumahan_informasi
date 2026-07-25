import {
  Users, Wallet, Droplets, Waves, CalendarDays, Store, ReceiptText, Landmark,
  Map, KeyRound, Megaphone, ClipboardList, Building2, MapPin, Inbox, LayoutDashboard,
  ArrowRightLeft, ShieldCheck, Trash2, Sparkles, HandCoins, UserCog, PenLine,
  Ambulance, Flame, Zap, Phone, PieChart, Vote, Home, MessageSquare, Images,
  ArrowRight, ExternalLink, Menu, X, Printer, Search, Pencil, Plus, LogOut,
  ChevronDown, Crown, HelpCircle,
} from "lucide-react";

const REG = {
  Users, Wallet, Droplets, Waves, CalendarDays, Store, ReceiptText, Landmark,
  Map, KeyRound, Megaphone, ClipboardList, Building2, MapPin, Inbox, LayoutDashboard,
  ArrowRightLeft, ShieldCheck, Trash2, Sparkles, HandCoins, UserCog, PenLine,
  Ambulance, Flame, Zap, Phone, PieChart, Vote, Home, MessageSquare, Images,
  ArrowRight, ExternalLink, Menu, X, Printer, Search, Pencil, Plus, LogOut,
  ChevronDown, Crown,
};

// <Icon name="Users" /> — dipakai untuk ikon yang datang dari data (string).
export function Icon({ name, ...props }) {
  const C = REG[name] || HelpCircle;
  return <C {...props} />;
}

// Wadah ikon premium: kotak rounded dengan ring & aksen oranye lembut.
export function IconBox({ name, Comp, size = 20, className = "", tone = "orange" }) {
  const C = Comp || REG[name] || HelpCircle;
  const tones = {
    orange: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
    neutral: "bg-white/5 text-zinc-200 ring-white/10",
  };
  return (
    <span className={`inline-grid place-items-center rounded-xl ring-1 ${tones[tone]} ${className}`}>
      <C size={size} strokeWidth={1.75} />
    </span>
  );
}

export default REG;
