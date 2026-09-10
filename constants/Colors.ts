const tintColorLight = '#00F0FF'; // Cyber Cyan
const tintColorDark = '#8B5CF6';  // Neon Purple

export default {
  light: {
    text: '#F3F4F6',           // Bright text for contrast
    background: '#1A1A24',     // Dark slate gaming bg
    tint: tintColorLight,
    tabIconDefault: '#64748B', 
    tabIconSelected: tintColorLight,
    card: '#27273A',           // Elevated panel
    border: '#33334D',         // Subtle border
  },
  dark: {
    text: '#F8FAFC',           
    background: '#0B0E14',     // Midnight black
    tint: tintColorDark,
    tabIconDefault: '#475569', 
    tabIconSelected: tintColorDark,
    card: '#151A22',           // Space black card
    border: '#2A303C',         
  },
};
