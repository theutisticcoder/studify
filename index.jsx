import React, { useState, useEffect } from "react";

// Modern Study App — single-file React component with embedded backend mock

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
  if (mode === 'full') {
    // Mock full-length exam: 55 MCQs, 3 FRQs (customize as needed)
    const mcq = Array.from({ length: 55 }).map((_, i) => ({
      question: `${examName} — Full-Length MCQ ${i + 1}`,
      choices: ["A", "B", "C", "D"],
      answer: ["A", "B", "C", "D"][i % 4]
    }));
    const frq = Array.from({ length: 3 }).map((_, i) => ({
      question: `${examName} — Full-Length FRQ ${i + 1}`
    }));
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
      setExamData({ ...body, title: examName, fullLength: false });
      setRoute('examSession');
    } catch (err) {
      setExamError(err.message);
    } finally {
      setExamLoading(false);
    }
  }

  async function generateFullExam(examName) {
    setExamError(null);
    setExamLoading(true);
    setExamData(null);
    setSelectedExam(examName);
    try {
      const body = await geminiApi({ mode: 'full', examName, prompt: '' });
      if (!body || !Array.isArray(body.mcq) || !Array.isArray(body.frq)) throw new Error('Bad exam format');
      setExamData({ ...body, title: examName, fullLength: true });
      setRoute('examSession');
    } catch (err) {
      setExamError(err.message);
    } finally {
      setExamLoading(false);
    }
  }

  return (
    <>
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <span className="font-bold text-xl">Modern Study App</span>
          <nav className="flex gap-3">
            <button onClick={() => go('explore')} className="px-3 py-1 rounded border">Exams</button>
            <button onClick={() => go('plan')} className="px-3 py-1 rounded border">Study Plan</button>
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
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={() => addPlannerItem(exam)} className="px-3 py-1 bg-slate-100 rounded">Add Plan</button>
                    <button onClick={() => generateExam(exam)} className="px-3 py-1 bg-indigo-600 text-white rounded">Take Practice Exam</button>
                    <button onClick={() => generateFullExam(exam)} className="px-3 py-1 bg-teal-600 text-white rounded">Full-Length Exam</button>
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
    </>
  );
}

// --- ExamSession component updated to show full-length status ---
function ExamSession({ exam, onClose }) {
  const [index, setIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState(Array(exam.mcq.length).fill(null));
  const [frqAnswers, setFrqAnswers] = useState(Array(exam.frq.length).fill(''));

  const total = (exam.mcq?.length || 0) + (exam.frq?.length || 0);

  function jumpTo(i) { if (i >= 0 && i < total) setIndex(i); }
  function handleMcqAnswer(choice) { const copy = [...mcqAnswers]; copy[index] = choice; setMcqAnswers(copy); }
  function handleFrqChange(text) { const idx = index - (exam.mcq?.length || 0); if (idx >= 0) { const copy = [...frqAnswers]; copy[idx] = text; setFrqAnswers(copy); } }

  function getScore() {
    let score = 0;
    exam.mcq.forEach((q, i) => { if (mcqAnswers[i] === q.answer) score++; });
    return score;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{exam.title} {exam.fullLength && <span className="text-teal-600 text-base">Full-Length</span>} Exam</h2>
        <button onClick={onClose} className="px-3 py-1 rounded border">Exit</button>
      </div>
      <div className="mb-2 text-sm text-slate-500">
        {exam.fullLength ? `This is a full-length exam. MCQs: ${exam.mcq.length}, FRQs: ${exam.frq.length}` : `MCQs: ${exam.mcq.length}, FRQs: ${exam.frq.length}`}
      </div>
      <hr className="mb-4" />
      {index < exam.mcq.length ? (
        <div>
          <div className="font-semibold mb-2">MCQ {index + 1} of {exam.mcq.length}</div>
          <div className="mb-4">{exam.mcq[index].question}</div>
          <div className="flex flex-col gap-2 mb-4">
            {exam.mcq[index].choices.map(choice =>
              <button key={choice}
                className={`px-3 py-2 rounded ${mcqAnswers[index] === choice ? 'bg-indigo-100' : 'bg-slate-100'}`}
                onClick={() => handleMcqAnswer(choice)}>
                {choice}
              </button>
            )}
          </div>
          <button onClick={() => jumpTo(index + 1)} className="px-4 py-1 bg-indigo-600 text-white rounded">Next</button>
        </div>
      ) : (
        <>
          {index - exam.mcq.length < exam.frq.length ? (
            <div>
              <div className="font-semibold mb-2">FRQ {index - exam.mcq.length + 1} of {exam.frq.length}</div>
              <div className="mb-4">{exam.frq[index - exam.mcq.length].question}</div>
              <textarea
                className="w-full p-2 border rounded mb-4"
                rows={6}
                value={frqAnswers[index - exam.mcq.length]}
                onChange={e => handleFrqChange(e.target.value)}
              />
              <button onClick={() => jumpTo(index + 1)} className="px-4 py-1 bg-indigo-600 text-white rounded">Next</button>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="font-bold mb-3">Exam Finished!</h3>
              <div className="mb-4">Your MCQ Score: {getScore()} / {exam.mcq.length}</div>
              <div className="mb-4">FRQs are for practice; review your answers independently.</div>
              <button onClick={onClose} className="px-4 py-2 bg-teal-600 text-white rounded">Return to Exams</button>
            </div>
          )}
        </>
      )}
      <div className="mt-6 flex gap-2 flex-wrap">
        {[...Array(total).keys()].map(i =>
          <button key={i}
            className={`px-2 py-1 rounded text-xs ${i === index ? 'bg-teal-200' : 'bg-slate-100'}`}
            onClick={() => jumpTo(i)}>{i + 1}</button>
        )}
      </div>
    </div>
  );
}