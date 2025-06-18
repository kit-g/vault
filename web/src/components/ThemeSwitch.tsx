import { useTheme } from '../features/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeSwitchButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={ toggleTheme }
      aria-label="Toggle light and dark theme"
      className={ `btn-icon ${ className || '' }` }
    >
      { theme === 'light' ? (
        <Moon size={ 24 }/>
      ) : (
        <Sun size={ 24 }/>
      ) }
    </button>
  );
}