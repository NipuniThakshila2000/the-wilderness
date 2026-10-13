import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        wilderness: {
          ink: "#101712",
          pine: "#16251d",
          moss: "#304434",
          sage: "#8fa58d",
          glass: "#d7e1d3",
          paper: "#f3f6ef",
          warning: "#c19145",
          danger: "#b45a4f"
        }
      },
      boxShadow: {
        court: "0 18px 60px rgba(7, 13, 9, 0.34)"
      }
    }
  },
  plugins: []
};

export default config;
