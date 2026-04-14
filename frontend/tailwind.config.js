/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#13ecec',
                    dark: '#0ea5a5',
                    light: '#a7f3f3',
                    50: '#effefe',
                    100: '#c6fcfc',
                    200: '#8ef9f9',
                    300: '#4ef4f4',
                    400: '#13ecec',
                    500: '#0ea5a5',
                    600: '#0c8585',
                    700: '#0a6666',
                    800: '#084e4e',
                    900: '#063939',
                },
                secondary: {
                    DEFAULT: '#f97316',
                    50: '#fff7ed',
                    100: '#ffedd5',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                },
                navy: {
                    900: '#0d1b1b',
                    800: '#152a2a',
                    700: '#1e3b3b',
                    600: '#2a5050',
                },
                background: {
                    light: '#f6f8f8',
                    dark: '#102222',
                },
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                full: '9999px',
            },
        },
    },
    plugins: [],
}
