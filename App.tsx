
import React, { useState, useMemo, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import AITutorView from './components/AITutorView';
import APExamsView from './components/APExamsView';
import APExamDetailView from './components/APExamDetailView';
import exams from '../exams';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeValue = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
          <Header />
          <main className="p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tutor" element={<AITutorView />} />
              <Route path="/exams" element={<APExamsView />} />
              <Route path="/exams/:examId" element={<APExamDetailView />} />
              <Route path="/explore" element={<exams />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ThemeContext.Provider>
  );
};

export default App;
