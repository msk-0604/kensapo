"use client";

import Link from "next/link";
import {
  Bell,
  Calendar,
  Camera,
  CircleHelp,
  FileText,
  Hand,
  History,
  LayoutDashboard,
  ListChecks,
  Mail,
  MapPin,
  PlayCircle,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { HelpCategory } from "@/lib/help/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Hand,
  LayoutDashboard,
  MapPin,
  Users,
  Calendar,
  FileText,
  Camera,
  ListChecks,
  Bell,
  User,
  Settings,
  CircleHelp,
  PlayCircle,
  Mail,
  History,
};

export function HelpCategoryCards({
  categories,
}: {
  categories: HelpCategory[];
}) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {sorted.map((cat) => {
        const Icon = ICONS[cat.icon] ?? CircleHelp;
        const href = cat.href ?? `/help/${cat.id}`;
        return (
          <Link
            key={cat.id}
            href={href}
            className={cn(
              "flex min-h-[5.5rem] items-start gap-4 rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-colors",
              "hover:border-navy-700 hover:bg-navy-900/5 active:bg-navy-900/10"
            )}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white">
              <Icon className="h-7 w-7" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xl font-bold text-navy-950">
                {cat.title}
              </span>
              <span className="mt-1 block text-base leading-snug text-gray-600">
                {cat.description}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
