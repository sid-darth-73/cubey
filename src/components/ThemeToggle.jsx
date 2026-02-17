import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors hover:bg-surface-hover/20 text-text-muted hover:text-primary ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
