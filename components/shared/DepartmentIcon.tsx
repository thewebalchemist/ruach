// components/shared/DepartmentIcon.tsx
// departments.icon stores a lucide-react component name (e.g. "Music",
// "Heart", "ShoppingCart") as seeded in supabase/_legacy_flat_schema/schema.sql
// and the RBAC migration — not an emoji. Resolves that name to the real icon.
import {
  Music, Monitor, Users, Heart, Zap, BookOpen, Globe, Coffee, ShoppingCart,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Music, Monitor, Users, Heart, Zap, BookOpen, Globe, Coffee, ShoppingCart,
};

interface DepartmentIconProps {
  name: string | null | undefined;
  className?: string;
}

export function DepartmentIcon({ name, className = 'w-6 h-6' }: DepartmentIconProps) {
  const Icon = (name && ICON_MAP[name]) || Users;
  return <Icon className={className} />;
}
