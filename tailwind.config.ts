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
  			// Lottery red theme color
  			lottery: {
  				red: '#E13C39',
  				'red-dark': '#c22d2b',
  				'red-light': '#f05a57',
  			},
  			// Legacy color tokens
  			gov: {
  				red: '#E13C39',
  				'red-dark': '#c22d2b',
  				'red-light': '#f05a57',
  				gold: '#c8a45c',
  				'gold-light': '#e8c97a',
  				bg: '#f5f5f7',
  				border: '#e5e5ea',
  				text: '#1d1d1f',
  				'text-light': '#6e6e73',
  				'text-muted': '#8e8e93',
  			},
  			apple: {
  				blue: '#007AFF',
  				green: '#34C759',
  				red: '#FF3B30',
  				orange: '#FF9500',
  				purple: '#AF52DE',
  				teal: '#5AC8FA',
  				gray: '#8e8e93',
  				bg: '#f5f5f7',
  			},
  			/* Material Design 3 semantic color tokens */
  			md: {
  				primary: 'var(--md-primary)',
  				'on-primary': 'var(--md-on-primary)',
  				'primary-container': 'var(--md-primary-container)',
  				'on-primary-container': 'var(--md-on-primary-container)',
  				secondary: 'var(--md-secondary)',
  				'on-secondary': 'var(--md-on-secondary)',
  				'secondary-container': 'var(--md-secondary-container)',
  				'on-secondary-container': 'var(--md-on-secondary-container)',
  				tertiary: 'var(--md-tertiary)',
  				'on-tertiary': 'var(--md-on-tertiary)',
  				'tertiary-container': 'var(--md-tertiary-container)',
  				'on-tertiary-container': 'var(--md-on-tertiary-container)',
  				error: 'var(--md-error)',
  				'on-error': 'var(--md-on-error)',
  				'error-container': 'var(--md-error-container)',
  				'on-error-container': 'var(--md-on-error-container)',
  				surface: 'var(--md-surface)',
  				'on-surface': 'var(--md-on-surface)',
  				'surface-variant': 'var(--md-surface-variant)',
  				'on-surface-variant': 'var(--md-on-surface-variant)',
  				'surface-container-lowest': 'var(--md-surface-container-lowest)',
  				'surface-container-low': 'var(--md-surface-container-low)',
  				'surface-container': 'var(--md-surface-container)',
  				'surface-container-high': 'var(--md-surface-container-high)',
  				'surface-container-highest': 'var(--md-surface-container-highest)',
  				outline: 'var(--md-outline)',
  				'outline-variant': 'var(--md-outline-variant)',
  				'inverse-surface': 'var(--md-inverse-surface)',
  				'inverse-on-surface': 'var(--md-inverse-on-surface)',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
  			'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
  			'md': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02)',
  			'lg': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.03)',
  			'xl': '0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.04)',
  			'card': '0 2px 12px rgba(0, 0, 0, 0.04)',
  			'card-hover': '0 8px 30px rgba(0, 0, 0, 0.08)',
  			'glass': '0 2px 16px rgba(0, 0, 0, 0.06)',
  			/* MD3 Elevation levels */
  			'md-1': '0 1px 3px 1px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3)',
  			'md-2': '0 2px 6px 2px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.3)',
  			'md-3': '0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.3)',
  			'md-4': '0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px rgba(0,0,0,0.3)',
  			'md-5': '0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px rgba(0,0,0,0.3)',
  			// Legacy aliases
  			'gov': '0 2px 12px rgba(0, 0, 0, 0.04)',
  			'gov-md': '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.02)',
  			'gov-lg': '0 8px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.03)',
  		},
  		animation: {
  			'fade-in': 'fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'fade-in-up': 'fade-in-up 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'slide-in-left': 'slide-in-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  			'scale-in': 'scale-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
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
  			'scale-in': {
  				'from': { opacity: '0', transform: 'scale(0.95)' },
  				'to': { opacity: '1', transform: 'scale(1)' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
