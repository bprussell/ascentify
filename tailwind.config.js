/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'2xl': '1.25rem',
  			'3xl': '1.5rem'
  		},
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
  			mint: {
  				DEFAULT: '#2DDDA8',
  				dark: '#1A8F6C',
  				pale: '#C2F4DF',
  				50: '#EDFDF6',
  				100: '#C2F4DF',
  				500: '#2DDDA8',
  				700: '#1A8F6C',
  				900: '#0D5A43'
  			},
  			lavender: {
  				DEFAULT: '#A78BFA',
  				deep: '#6D48D7',
  				soft: '#ECE7FF',
  				50: '#F5F3FF',
  				100: '#ECE7FF',
  				500: '#A78BFA',
  				700: '#6D48D7',
  				900: '#4C2DA0'
  			},
  			coral: {
  				DEFAULT: '#FF6B6B',
  				burnt: '#D14A4A',
  				peach: '#FFB8B8',
  				50: '#FFF5F5',
  				500: '#FF6B6B',
  				700: '#D14A4A'
  			},
  			ochre: {
  				DEFAULT: '#F5B080',
  				sand: '#E69A66',
  				cream: '#FCE4D3',
  				50: '#FFF7F0',
  				500: '#F5B080',
  				700: '#E69A66'
  			},
  			slate: {
  				50: '#F0F0F2',
  				100: '#E8E8EB',
  				200: '#DADADD',
  				300: '#B5B5BA',
  				400: '#8E8E96',
  				500: '#6B6B72',
  				600: '#52525A',
  				700: '#3F3F46',
  				800: '#27272A',
  				900: '#18181B',
  				950: '#0A0A0A'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'groove-fill': {
  				'0%': { width: '0%' },
  				'90%': { width: 'calc(var(--target-width) + 2%)' },
  				'100%': { width: 'var(--target-width)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'groove-fill': 'groove-fill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
