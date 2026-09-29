/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        // severity / status palette
        critical: "hsl(0 72% 51%)",
        high: "hsl(25 95% 53%)",
        medium: "hsl(45 93% 47%)",
        low: "hsl(199 89% 48%)",
        normal: "hsl(142 71% 45%)",
      },
    },
  },
  plugins: [],
};
