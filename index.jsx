import React, { useState, useEffect } from "react";

// Modern Study App — single-file React component with embedded backend mock
// Note: In a real deployment you would separate the API (serverless function) into /pages/api/gemini.js.
// Here we simulate the Gemini backend locally for demo purposes.

const AP_EXAMS = [ 
  'AP Art History', 'AP Biology', 'AP Calculus AB', 'AP Calculus BC', 'AP Capstone Seminar', 'AP Capstone Research',
  'AP Chemistry', 'AP Chinese Language & Culture', 'AP Comparative Government & Politics', 'AP Computer Science A',
  'AP Computer Science Principles', 'AP English Language & Composition', 'AP English Literature & Composition',
  'AP Environmental Science', 'AP European History', 'AP French Language & Culture', 'AP German Language & Culture',
  'AP Human Geography', 'AP Italian Language & Culture', 'AP Japanese Language & Culture', 'AP Latin',
  'AP Macroeconomics', 'AP Microeconomics', 'AP Music Theory', 'AP Physics 1', 'AP Physics 2',
  'AP Physics C: Electricity & Magnetism', 'AP Physics C: Mechanics', 'AP Psychology', 'AP Research', 'AP Seminar',
  'AP Spanish Language & Culture', 'AP Spanish Literature & Culture', 'AP Statistics', 'AP United States Government & Politics',
  'AP United States History', 'AP World History: Modern'
];

// Mock Gemini API in the same file
async function geminiApi({ mode, examName, prompt }) {
  if (mode === 'exam') {
    // Create mock exam with 5 MCQs and 1 FRQ for demo
    const mcq = Array.from({ length: 5 }).map((_, i) => ({
      question: `${examName} — Sample MCQ ${i + 1}`,
      choices: ["A", "B", "C", "D"],
      answer: ["A", "B", "C", "D"][i % 4]
    }));
    const frq = [
      { question: `${examName} — Sample Free Response Question` }
    ];
    return { mcq, frq };
  }
  // default mock
  return { output: JSON.stringify({ mcq: [], frq: [] }) };
}

export default function ModernStudyApp() {
  const [route, setRoute] = useState("home");
  const [selectedExam, setSelectedExam] = useState(null);
  const [planner, setPlanner] = useState({});
  const [examData, setExamData] = useState(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState(null);

  useEffect(() => {
    try { const raw = localStorage.getItem("msap_planner_v1"); if (raw) setPlanner(JSON.parse(raw)); } catch (e) {}
  }, []);

  useEffect(() => { try { localStorage.setItem("msap_planner_v1", JSON.stringify(planner)); } catch (e) {} }, [planner]);

  function go(r) { setRoute(r); }

  function addPlannerItem(exam) {
    const id = exam.replace(/\s+/g, "_").toLowerCase();
    if (planner[id]) return;
    const schedule = generateStudyPlanForExam(exam);
    setPlanner(prev => ({ ...prev, [id]: { exam, schedule, created: Date.now() } }));
  }

  function generateStudyPlanForExam(exam) {
    const weeks = 12;
    return Array.from({ length: weeks }).map((_, i) => ({
      week: i + 1,
      focus: `${exam} — Unit ${Math.min(i + 1, 12)}`,
      goal: `Practice problems, timed section, and review.`
    }));
  }

  async function generateExam(examName) {
    setExamError(null);
    setExamLoading(true);
    setExamData(null);
    setSelectedExam(examName);
    try {
      const body = await geminiApi({ mode: 'exam', examName, prompt: '' });
      if (!body || !Array.isArray(body.mcq) || !Array.isArray(body.frq)) throw new Error('Bad exam format');
      setExamData({ ...body, title: examName });
      setRoute('examSession');
    } catch (err) {
      setExamError(err.message);
    } finally {
      setExamLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <button onClick={() => go('home')} className="text-2xl font-extrabold">StudyHub</button>
            <div className="text-sm text-slate-500">Free AI tools • AP Planner • Accessibility</div>
          </div>
          <nav className="flex gap-3">
            <button onClick={() => go('explore')} className="px-3 py-1 rounded border">Explore</button>
            <button onClick={() => go('planner')} className="px-3 py-1 rounded border">Planner</button>
            <button onClick={() => go('ai')} className="px-3 py-1 rounded border">AI Tools</button>
            <button onClick={() => go('acc')} className="px-3 py-1 rounded border">Accommodations</button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {route === 'home' && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h1 className="text-3xl font-bold">A modern study site with free AI tools</h1>
              <p className="mt-2 text-slate-600">Personalized study plans, Gemini-generated practice exams, and accessibility options.</p>
              <div className="mt-4">
                <button onClick={() => go('explore')} className="px-4 py-2 bg-indigo-600 text-white rounded">Explore Exams</button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-teal-400 text-white p-6 rounded shadow">
              <h3 className="font-bold">Quick Start</h3>
              <ol className="mt-3 list-decimal pl-6">
                <li>Explore an AP exam.</li>
                <li>Click "Take Practice Exam" to generate a test.</li>
                <li>Navigate questions and finish to see your MCQ grade.</li>
              </ol>
            </div>
          </section>
        )}

        {route === 'explore' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Explore AP Exams</h2>
            {examError && <div className="text-red-600 mb-3">{examError}</div>}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {AP_EXAMS.map((exam) => (
                <div key={exam} className="bg-white p-4 rounded shadow flex flex-col">
                  <div className="font-semibold">{exam}</div>
                  <div className="text-sm text-slate-500 mt-1">Dynamic exam generation via Gemini</div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => addPlannerItem(exam)} className="px-3 py-1 bg-slate-100 rounded">Add Plan</button>
                    <button onClick={() => generateExam(exam)} className="px-3 py-1 bg-indigo-600 text-white rounded">Take Practice Exam</button>
                  </div>
                </div>
              ))}
            </div>
            {examLoading && (<div className="mt-6 p-4 bg-yellow-50 border rounded">Generating exam…</div>)}
          </section>
        )}

        {route === 'examSession' && examData && (
          <section>
            <ExamSession exam={examData} onClose={() => { setExamData(null); go('explore'); }} />
          </section>
        )}
      </main>

      <footer className="max-w-5xl mx-auto mt-8 text-sm text-slate-500 p-4">© {new Date().getFullYear()} StudyHub — Preview</footer>
    </div>
  );
}

function ExamSession({ exam, onClose }) {
  const total = (exam.mcq?.length || 0) + (exam.frq?.length || 0);
  const [index, setIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState(Array(exam.mcq?.length || 0).fill(null));
  const [frqAnswers, setFrqAnswers] = useState(Array(exam.frq?.length || 0).fill(''));
  const [finished, setFinished] = useState(false);

  function jumpTo(i) { if (i >= 0 && i < total) setIndex(i); }
  function handleMcqAnswer(choice) { const copy = [...mcqAnswers]; copy[index] = choice; setMcqAnswers(copy); }
  function handleFrqChange(text) { const idx = index - (exam.mcq?.length || 0); if (idx >= 0) { const copy = [...frqAnswers]; copy[idx] = text; setFrqAnswers(copy); } }

  if (finished) {
    const correctCount = exam.mcq.reduce((sum, q, i) => sum + (mcqAnswers[i] === q.answer ? 1 : 0), 0);
    const mcqTotal = exam.mcq.length;
    const percent = mcqTotal === 0 ? 0 : Math.round((correctCount / mcqTotal) * 100);
    return (
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">Results — {exam.title}</h2>
        <div className="mt-2">MCQ Score: {correctCount} / {mcqTotal} ({percent}%)</div>
        <button onClick={onClose} className="mt-4 px-3 py-1 border rounded">Close</button>
      </div>
    );
  }

  const isMcq = index < exam.mcq.length;
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Practice Exam — {exam.title}</h2>
      <div className="mt-3">Question {index + 1} of {total}</div>
      <div className="mt-4">
        {isMcq ? (
          <div>
            <div className="font-semibold">{exam.mcq[index].question}</div>
            <div className="mt-3 grid gap-2">
              {exam.mcq[index].choices.map((c, i) => (
                <button key={i} onClick={() => handleMcqAnswer(c)} className={`text-left px-3 py-2 border rounded ${mcqAnswers[index] === c ? 'bg-indigo-100' : ''}`}>{c}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="font-semibold">{exam.frq[index - exam.mcq.length].question}</div>
            <textarea value={frqAnswers[index - exam.mcq.length] || ''} onChange={(e) => handleFrqChange(e.target.value)} rows={6} className="w-full mt-3 border rounded p-2" />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => jumpTo(Math.max(0, index - 1))} className="px-3 py-1 border rounded">Prev</button>
        <button onClick={() => jumpTo(Math.min(total - 1, index + 1))} className="px-3 py-1 border rounded">Next</button>
        {index === total - 1 && <button onClick={() => setFinished(true)} className="px-3 py-1 bg-green-600 text-white rounded">Finish</button>}
      </div>
    </div>
  );
}
