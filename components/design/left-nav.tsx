"use client";
import { Panel, useDesignStore } from "@/store/design-store";
import {
  Box,
  Ruler,
  Layers,
  Upload,
  Type,
  FolderOpen,
  LucideIcon,
} from "lucide-react";
const items: { key: Panel; label: string; icon: LucideIcon }[] = [
  { key: "model", label: "Model", icon: Box },
  { key: "size", label: "Ukuran", icon: Ruler },
  { key: "material", label: "Material", icon: Layers },
  { key: "upload", label: "Upload", icon: Upload },
  { key: "text", label: "Text", icon: Type },
  { key: "project", label: "Project", icon: FolderOpen },
] as const;
export default function LeftNav() {
  const active = useDesignStore((s) => s.activePanel);
  const setActive = useDesignStore((s) => s.setActivePanel);
  const isVisible = useDesignStore((s) => s.isVisible);
  const setIsVisible = useDesignStore((s) => s.setIsVisible);
  const handleClick = (id: (typeof items)[number]["key"]) => {
    setActive(id);
    setIsVisible(active === id ? !isVisible : true);
  };
  return (
    <div className="flex h-[calc(100dvh-96px)] flex-col items-stretch px-2 py-3 gap-2">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => handleClick(it.key)}
            className={`flex flex-col items-center gap-2 rounded-md px-2 py-3 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring ${
              active === it.key ? "bg-accent" : ""
            }`}
            aria-current={active === it.key ? "page" : undefined}
            aria-label={it.label}
          >
             <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-[11px] text-muted-foreground">
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}