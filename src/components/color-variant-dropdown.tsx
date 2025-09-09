"use client";

import { Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const variants = [
  {
    name: "Default",
    value: "default",
    description: "Default color scheme",
    color: "bg-gray-500",
  },
  {
    name: "Blue",
    value: "blue",
    description: "Blue color scheme",
    color: "bg-blue-500",
  },
  {
    name: "Slate",
    value: "slate",
    description: "Slate color scheme",
    color: "bg-slate-500",
  },
];

export function ColorVariantDropdown() {
  const { variant, setVariant } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Select color scheme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        {variants.map((variantOption) => (
          <DropdownMenuItem
            key={variantOption.value}
            onClick={() => setVariant(variantOption.value as any)}
            className="flex items-center gap-2"
          >
            <div className={`h-3 w-3 rounded-full ${variantOption.color}`} />
            <span>{variantOption.name}</span>
            {variant === variantOption.value && (
              <span className="ml-auto text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
