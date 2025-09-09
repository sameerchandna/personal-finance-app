"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type ThemeVariant = "default" | "blue" | "slate";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultVariant?: ThemeVariant;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  variant: ThemeVariant;
  setTheme: (theme: Theme) => void;
  setVariant: (variant: ThemeVariant) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  variant: "default",
  setTheme: () => null,
  setVariant: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultVariant = "default",
  storageKey = "nextapp-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [variant, setVariant] = useState<ThemeVariant>(defaultVariant);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem(`${storageKey}-mode`) as Theme;
    const storedVariant = localStorage.getItem(`${storageKey}-variant`) as ThemeVariant;
    
    if (storedTheme) {
      setTheme(storedTheme);
    }
    if (storedVariant) {
      setVariant(storedVariant);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove("light", "dark", "blue", "slate");

    // Add variant class
    if (variant !== "default") {
      root.classList.add(variant);
    }

    // Add theme class
    root.classList.add(theme);
  }, [theme, variant, mounted]);

  const value = {
    theme,
    variant,
    setTheme: (theme: Theme) => {
      if (mounted) {
        localStorage.setItem(`${storageKey}-mode`, theme);
        setTheme(theme);
      }
    },
    setVariant: (variant: ThemeVariant) => {
      if (mounted) {
        localStorage.setItem(`${storageKey}-variant`, variant);
        setVariant(variant);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
