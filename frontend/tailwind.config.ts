import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af"
        },
      },
      boxShadow: {
        panel: "0 10px 30px -12px rgba(15,23,42,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
