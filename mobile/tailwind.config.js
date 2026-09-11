/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        snapchat: {
          yellow: "#FFFC00",
          yellowHover: "#E6E300",
          dark: "#0F172A",
          glass: "rgba(255, 255, 255, 0.75)",
          glassDark: "rgba(15, 23, 42, 0.85)",
        },
        telegram: {
          blue: "#0088cc",
          lightBlue: "#2AABEE",
        },
        twitter: {
          blue: "#1DA1F2",
          dark: "#15202B",
        }
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        apple: "0 10px 30px -10px rgba(0, 0, 0, 0.12)",
        glow: "0 0 20px rgba(255, 252, 0, 0.4)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      }
    },
  },
  plugins: [],
};
