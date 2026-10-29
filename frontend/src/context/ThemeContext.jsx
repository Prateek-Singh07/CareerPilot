import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material";

export const ColorModeContext = createContext({
  mode: "light",
  toggleColorMode: () => {},
});

export function useColorMode() {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ThemeCustomProvider");
  }
  return context;
}

function getInitialMode() {
  try {
    const saved = localStorage.getItem("careerpilot_theme");
    if (saved === "light" || saved === "dark") return saved;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch (err) {
    console.error("Theme detection error:", err);
  }
  return "light";
}

export function ThemeCustomProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem("careerpilot_theme", mode);
      document.documentElement.setAttribute("data-theme", mode);
      document.documentElement.style.colorScheme = mode;
    } catch (e) {
      console.warn("Could not save theme preference:", e);
    }
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    [mode]
  );

  const theme = useMemo(() => {
    const isDark = mode === "dark";
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDark ? "#D99573" : "#B96F50",
          light: isDark ? "#E5A789" : "#D99573",
          dark: isDark ? "#B96F50" : "#A45D41",
        },
        secondary: {
          main: isDark ? "#9BAF91" : "#71866B",
          light: isDark ? "#B4C5AB" : "#9BAF91",
          dark: isDark ? "#71866B" : "#5B6E56",
        },
        background: {
          default: isDark ? "#171614" : "#F8F6F2",
          paper: isDark ? "#22201D" : "#FFFEFC",
        },
        text: {
          primary: isDark ? "#F3EEE8" : "#332C28",
          secondary: isDark ? "#B4AAA0" : "#776D65",
        },
        divider: isDark ? "#3A352F" : "rgba(51, 44, 40, 0.08)",
        action: {
          hover: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
        },
        custom: {
          surfaceElevated: isDark ? "#2B2824" : "#F0EBE4",
          cardBorder: isDark ? "#3A352F" : "rgba(51, 44, 40, 0.08)",
          cardBorderHover: isDark ? "rgba(217, 149, 115, 0.35)" : "rgba(185, 111, 80, 0.3)",
          accentLight: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
          secondaryLight: isDark ? "rgba(155, 175, 145, 0.18)" : "rgba(113, 134, 107, 0.14)",
          shadowCard: isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 2px 10px rgba(51, 44, 40, 0.03)",
          shadowHover: isDark ? "0 8px 30px rgba(0, 0, 0, 0.6)" : "0 8px 24px rgba(185, 111, 80, 0.12)",
          inputBg: isDark ? "#2B2824" : "#F8F6F2",
          inputBorder: isDark ? "#3A352F" : "rgba(51, 44, 40, 0.12)",
        },
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800, letterSpacing: "-0.03em" },
        h2: { fontWeight: 800, letterSpacing: "-0.02em" },
        h3: { fontWeight: 800, letterSpacing: "-0.01em" },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: { textTransform: "none", fontWeight: 700 },
      },
      shape: { borderRadius: 16 },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: isDark ? "#22201D" : "#FFFEFC",
              border: `1px solid ${isDark ? "#3A352F" : "rgba(51, 44, 40, 0.08)"}`,
              borderRadius: 18,
              boxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 2px 10px rgba(51, 44, 40, 0.03)",
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 12,
              padding: "9px 22px",
              fontSize: "0.92rem",
              transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            },
            containedPrimary: {
              backgroundColor: isDark ? "#D99573" : "#B96F50",
              color: isDark ? "#171614" : "#FFFFFF",
              "&:hover": {
                backgroundColor: isDark ? "#E5A789" : "#A45D41",
              },
            },
            outlined: {
              borderColor: isDark ? "#3A352F" : "rgba(51, 44, 40, 0.15)",
              color: isDark ? "#F3EEE8" : "#332C28",
              "&:hover": {
                borderColor: isDark ? "#D99573" : "#B96F50",
                backgroundColor: isDark ? "rgba(217, 149, 115, 0.08)" : "rgba(185, 111, 80, 0.06)",
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 600,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: isDark ? "#22201D" : "#FFFEFC",
              border: `1px solid ${isDark ? "#3A352F" : "rgba(51, 44, 40, 0.1)"}`,
              borderRadius: 20,
              boxShadow: isDark ? "0 24px 60px rgba(0, 0, 0, 0.7)" : "0 24px 60px rgba(51, 44, 40, 0.15)",
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

