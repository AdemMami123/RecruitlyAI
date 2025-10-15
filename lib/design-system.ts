// Design System Configuration
// This file defines the design tokens and patterns used throughout the application

export const designSystem = {
  // Spacing scale (used for margin, padding, gap)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Typography scale
  typography: {
    // Font sizes
    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },

    // Font weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Line heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },

    // Letter spacing
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgb(255 215 0 / 0.3)', // Gold glow
  },

  // Animation durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component patterns
  components: {
    button: {
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      variants: {
        primary: 'bg-gradient-to-r from-primary to-accent text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'border-2 border-primary bg-transparent text-primary',
        ghost: 'bg-transparent hover:bg-primary/10',
      },
    },
    card: {
      base: 'rounded-xl border-2 bg-card text-card-foreground shadow-md',
      hover: 'hover:border-primary/50 hover:shadow-lg transition-all duration-300',
      interactive: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
    },
    input: {
      base: 'rounded-lg border-2 border-input bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all',
    },
  },

  // Color semantics (for reference)
  colors: {
    primary: {
      main: 'hsl(220, 60%, 25%)',      // Deep Blue
      light: 'hsl(220, 60%, 35%)',
      dark: 'hsl(220, 60%, 15%)',
    },
    accent: {
      main: 'hsl(45, 100%, 50%)',      // Gold
      light: 'hsl(45, 100%, 60%)',
      dark: 'hsl(45, 100%, 40%)',
    },
    secondary: {
      main: 'hsl(220, 10%, 35%)',      // Dark Grey
      light: 'hsl(220, 10%, 45%)',
      dark: 'hsl(220, 10%, 25%)',
    },
  },
}

// Framer Motion variants for common animations
export const motionVariants = {
  // Fade in from top
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },

  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },

  // Fade in from left
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },

  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },

  // Slide in from bottom (for modals)
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },

  // Stagger children
  staggerContainer: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },

  // Card hover
  cardHover: {
    initial: { scale: 1 },
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },

  // Page transition
  pageTransition: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
}

// Utility function to create staggered animations
export const createStaggerVariants = (staggerDelay = 0.1) => ({
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
})

// Responsive design utilities
export const responsive = {
  // Container max widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },

  // Common responsive patterns
  textSize: {
    heading: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
    subheading: 'text-xl sm:text-2xl md:text-3xl',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm',
  },

  spacing: {
    section: 'py-12 sm:py-16 md:py-20 lg:py-24',
    container: 'px-4 sm:px-6 md:px-8 lg:px-12',
  },

  grid: {
    twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    threeCol: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    fourCol: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
  },
}

export type DesignSystem = typeof designSystem
export type MotionVariants = typeof motionVariants
export type ResponsivePatterns = typeof responsive
