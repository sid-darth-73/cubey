// The design is always dark — no light mode per the design system.
// This hook is kept for API compatibility but always returns 'dark'.
export function useTheme() {
  return { theme: 'dark', toggleTheme: () => {} };
}
