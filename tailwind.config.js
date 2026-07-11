// tailwind.config.js — Tailwind v3 config with custom theme

/** @type {import('tailwindcss').Config} */
export default {
    // Tell Tailwind which files to scan for class names
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                // App brand colors — shiny black and white
                brand: {
                    black: '#0a0a0a',
                    'black-light': '#1a1a1a',
                    'black-mid': '#2a2a2a',
                    white: '#ffffff',
                    'white-soft': '#f8f8f8',
                    'white-mid': '#f0f0f0',
                    gray: '#6b7280',
                    accent: '#f59e0b',   // amber gold for highlights
                    'accent-light': '#fef3c7',
                    danger: '#ef4444',
                    success: '#22c55e',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'shiny': '0 4px 24px 0 rgba(0,0,0,0.10)',
                'shiny-lg': '0 8px 40px 0 rgba(0,0,0,0.15)',
                'card': '0 2px 16px 0 rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [],
}