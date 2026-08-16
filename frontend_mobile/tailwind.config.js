/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF9F5",
          100: "#F6F4EE",
          200: "#EFECE1",
          300: "#E5E1D3",
        },
        luxury: {
          dark: "#141414",
          card: "#FFFFFF",
          muted: "#787670",
          border: "#EBE8DF",
          amber: "#F2A93B",
          amberLight: "#FFF4E3",
          green: "#059669",
          greenLight: "#E6F7F0",
          red: "#DC2626",
          redLight: "#FEE2E2",
          purple: "#7C3AED",
          purpleLight: "#F3E8FF",
        }
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        "3xl": "24px",
        "4xl": "32px",
      },
      boxShadow: {
        card: "0 2px 14px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.02)",
        fab: "0 10px 25px -3px rgba(242, 169, 59, 0.45), 0 4px 6px -2px rgba(242, 169, 59, 0.25)",
        device: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
      }
    },
  },
  plugins: [],
}
