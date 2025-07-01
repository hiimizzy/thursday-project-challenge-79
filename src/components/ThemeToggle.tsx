
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Escuro</span>
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;
