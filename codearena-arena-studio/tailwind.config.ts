import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cyan: {
                    400: "#00f3ff",
                    500: "#00d8e2",
                    900: "#003b3e",
                },
                magenta: {
                    500: "#ff00ff",
                }
            },
        },
    },
    plugins: [],
};
export default config;
