
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AP_EXAMS } from '../constants';

const APExamCard: React.FC<{ exam: typeof AP_EXAMS[0] }> = ({ exam }) => {
  return (
    <Link to={`/exams/${exam.id}`} className="block h-full">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
          <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400">{exam.title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 flex-grow">{exam.description}</p>
          <div className="mt-4">
              {exam.subjects.map(subject => (
                  <span key={subject} className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">{subject}</span>
              ))}
          </div>
      </div>
    </Link>
  );
};

const APExamsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredExams = AP_EXAMS.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">AP Practice Exams</h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          Prepare for success with our A-graded, full-length practice exams.
        </p>
        <div className="mt-6 max-w-lg mx-auto">
            <input
                type="text"
                placeholder="Search for an exam (e.g., Calculus, History...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExams.map(exam => (
          <APExamCard key={exam.id} exam={exam} />
        ))}
      </div>
       {filteredExams.length === 0 && (
          <div className="text-center col-span-full py-12">
            <p className="text-slate-500 dark:text-slate-400">No exams found for "{searchTerm}". Try another search.</p>
          </div>
        )}
    </div>
  );
};

export default APExamsView;
