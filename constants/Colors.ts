const tintColorLight = '#8B5CF6'; // Vibrant Purple
const tintColorDark = '#A78BFA';  // Soft Neon Purple

export default {
  light: {
    text: '#0F172A',           // Deep slate
    background: '#F8FAFC',     // Clean slate bg
    tint: tintColorLight,
    tabIconDefault: '#94A3B8', // Slate 400
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F3F4F6',           // Bright light grey
    background: '#070A13',     // Minimal midnight black
    tint: tintColorDark,
    tabIconDefault: '#4B5563', // Dark grey
    tabIconSelected: tintColorDark,
    card: '#111625',           // Space black card
    border: '#1E293B',         // Subtle border
  },
};
