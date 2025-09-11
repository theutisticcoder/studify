
import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon } from './icons/SparklesIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto text-center px-4">
      <div className="py-20 lg:py-32">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Elevate Your Learning with <span className="text-primary-600 dark:text-primary-400">IntelliGrade</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
          Your all-in-one platform for mastering any subject. Get instant AI-powered help and access A-graded practice exams for all 36 AP courses.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/tutor"
            className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Start with AI Tutor
          </Link>
          <Link to="/exams" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300">
            Browse AP Exams <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="py-16 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Features</h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
          <div className="p-8 rounded-xl bg-white dark:bg-slate-800/50 shadow-lg">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
                <SparklesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Instant AI Support</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Stuck on a problem? Our Gemini-powered AI tutor is available 24/7 to provide step-by-step explanations, clarify concepts, and help you understand any subject.
            </p>
          </div>
          <div className="p-8 rounded-xl bg-white dark:bg-slate-800/50 shadow-lg">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/50 mb-4">
                <BookOpenIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Comprehensive AP Prep</h3>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Ace your exams with full-length practice tests for all 36 AP subjects. Our exams mirror the College Board format and curriculum, with options for accommodations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
