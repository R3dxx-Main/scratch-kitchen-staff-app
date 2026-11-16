// Scratch Kitchen brand, matched to the Staff Hub website.
export const colors = {
  red: '#D4202A',
  redDark: '#8E1219',
  ink: '#2A2323',
  cream: '#FAF6F3',
  white: '#FFFFFF',
  border: '#E8DFD9',
  inputBorder: '#B9ADA6',
  muted: '#5F5551',
  menuText: '#4A413D',
  railIcon: '#F2E9E4',
  tableHead: '#F3E7E1',
  activeTint: '#FBE3E4',
  countBadge: '#F7DFA5',
  disabledBg: '#E7E2DE',
  disabledText: '#4A413D',
  successBg: '#D7EBDC',
  successText: '#1F4A2B',
  blueBg: '#DCE8F7',
  blueText: '#14365F',
};

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// Order stage colours, same as the website.
export const stageBadge = [
  { bg: '#FBE3E4', fg: '#8E1219' }, // New
  { bg: '#F7DFA5', fg: '#4A3500' }, // In prep
  { bg: '#D7EBDC', fg: '#1F4A2B' }, // Ready
  { bg: '#E7E2DE', fg: '#4A413D' }, // Picked up
  { bg: '#DCE8F7', fg: '#14365F' }, // Skipped
];

// Minimum size of anything you can tap.
export const TAP = 48;

// Wide screens (tablet held sideways) get the website-style side rail.
export const WIDE_BREAKPOINT = 900;
