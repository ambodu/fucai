import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'apple-sm': '0 1px 8px rgba(0, 0, 0, 0.04)',
  			'apple': '0 4px 24px rgba(0, 0, 0, 0.06)',
  			'apple-lg': '0 8px 40px rgba(0, 0, 0, 0.08)',
  			'apple-xl': '0 12px 56px rgba(0, 0, 0, 0.12)',
  		},
  		animation: {
  			'fade-in': 'fade-in 0.6s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'slide-in-left': 'slide-in-left 0.3s ease-out',
  			'gradient-shift': 'gradient-shift 6s ease infinite',
  		},
  		keyframes: {
  			'fade-in': {
  				'from': { opacity: '0' },
  				'to': { opacity: '1' },
  			},
  			'fade-in-up': {
  				'from': { opacity: '0', transform: 'translateY(20px)' },
  				'to': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'slide-in-left': {
  				'from': { opacity: '0', transform: 'translateX(-20px)' },
  				'to': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'gradient-shift': {
  				'0%, 100%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
