export const CHILD_COLORS = [
  { name: '블루', hex: '#4A90D9', light: '#EBF3FB' },
  { name: '코럴', hex: '#E8734A', light: '#FDF0EB' },
  { name: '그린', hex: '#5BB88F', light: '#EDF7F2' },
];

export function childColor(index: number) {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

export const COLORS = {
  background: '#FAFBFC',
  surface: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  divider: '#E5E7EB',
  warning: '#FF9500',
  success: '#34C759',
  error: '#FF3B30',
  info: '#007AFF',
};
