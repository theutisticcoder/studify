
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpenIcon } from './icons/BookOpenIcon';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const activeLinkStyle = {
    color: '#3b82f6', // Corresponds to primary-500
  };
  
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-semibold leading-6 transition-colors duration-200 hover:text-primary-500 dark:hover:text-primary-400 ${
      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'
    }`;


  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <nav className="container mx-auto flex items-center justify-between p-4" aria-label="Global">
        <NavLink to="/" className="flex items-center gap-2 -m-1.5 p-1.5">
          <BookOpenIcon className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">IntelliGrade</span>
        </NavLink>
        <div className="flex lg:flex-1 items-center justify-end gap-x-6">
          <NavLink to="/tutor" className={getLinkClass}>
            AI Tutor
          </NavLink>
          <NavLink to="/exams" className={getLinkClass}>
            AP Exams
          </NavLink>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
