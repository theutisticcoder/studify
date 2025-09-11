
import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AP_EXAMS } from '../constants';
import { PracticeQuestion, FreeResponseQuestion, APExam } from '../types';
import { generatePracticeExam, generateFreeResponseQuestion, gradeFreeResponseAnswer } from '../services/geminiService';
import { LoaderIcon } from './icons/LoaderIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';

type ExamStatus = 'idle' | 'generating' | 'taking' | 'submitted' | 'error';
type FRQStatus = 'generating' | 'answering' | 'grading' | 'review' | 'error';
type PracticeMode = 'menu' | 'MCQ' | 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ';

const questionTypeDetails = {
    'MCQ': { name: 'Multiple-Choice Questions', description: 'Test your knowledge with a set of practice questions.' },
    'FRQ': { name: 'Free-Response Questions', description: 'Practice writing detailed answers to complex prompts.' },
    'SAQ': { name: 'Short Answer Questions', description: 'Practice answering multi-part historical questions concisely.' },
    'DBQ': { name: 'Document-Based Question', description: 'Analyze historical documents to construct a compelling essay.' },
    'LEQ': { name: 'Long Essay Question', description: 'Write an essay arguing a historical thesis.' },
};

// --- MCQ Practice Component ---
const MCQPractice: React.FC<{ exam: APExam; onExit: () => void }> = ({ exam, onExit }) => {
    const [status, setStatus] = useState<ExamStatus>('idle');
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleStartExam = useCallback(async () => {
        setStatus('generating');
        setError(null);
        try {
            const generatedQuestions = await generatePracticeExam(exam.title);
            if (generatedQuestions && generatedQuestions.length > 0) {
                setQuestions(generatedQuestions);
                setUserAnswers(new Array(generatedQuestions.length).fill(null));
                setCurrentQuestionIndex(0);
                setStatus('taking');
            } else {
                throw new Error("The generated exam was empty.");
            }
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setStatus('error');
        }
    }, [exam.title]);
    
    // Auto-start exam on component mount
    React.useEffect(() => {
        handleStartExam();
    }, [handleStartExam]);

    const handleAnswerSelect = (optionIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setStatus('submitted');
        }
    };

    const score = useMemo(() => {
        if (status !== 'submitted') return 0;
        return userAnswers.reduce((correctCount, answer, index) => (answer === questions[index].correctAnswerIndex ? correctCount + 1 : correctCount), 0);
    }, [status, userAnswers, questions]);

    if (status === 'generating') return <div className="text-center p-12"><LoaderIcon className="w-12 h-12 mx-auto animate-spin text-primary-600" /><h3 className="mt-4 text-xl font-semibold">Generating Your MCQ Set...</h3></div>;
    if (status === 'error') return <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><XCircleIcon className="w-12 h-12 mx-auto text-red-500" /><h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-200">Generation Failed</h3><p className="text-red-600 dark:text-red-300 mt-2">{error}</p><button onClick={handleStartExam} className="mt-6 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">Try Again</button></div>;

    if (status === 'taking' && questions.length > 0) {
        const currentQuestion = questions[currentQuestionIndex];
        const selectedAnswer = userAnswers[currentQuestionIndex];
        return (
            <div>
                <div className="flex justify-between items-center mb-2"><h3 className="text-sm font-semibold text-primary-600 dark:text-primary-400">Question {currentQuestionIndex + 1} of {questions.length}</h3></div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div></div>
                <p className="text-lg font-medium mt-4">{currentQuestion.question}</p>
                <div className="space-y-3 mt-6">
                    {currentQuestion.options.map((option, index) => (
                        <button key={index} onClick={() => handleAnswerSelect(index)} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedAnswer === index ? 'bg-primary-100 dark:bg-primary-900/50 border-primary-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-primary-400'}`}>
                            <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>{option}
                        </button>
                    ))}
                </div>
                <div className="mt-8 text-right"><button onClick={handleNextQuestion} disabled={selectedAnswer === null} className="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:bg-slate-400 dark:disabled:bg-slate-600">{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Exam'}</button></div>
            </div>
        );
    }
    
    if (status === 'submitted') {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div>
                <div className="text-center p-8 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <h3 className="text-2xl font-bold">MCQ Results</h3>
                    <p className="text-4xl font-extrabold mt-2 text-primary-600 dark:text-primary-400">{percentage}%</p>
                    <p className="text-slate-600 dark:text-slate-300">You answered {score} out of {questions.length} questions correctly.</p>
                    <button onClick={onExit} className="mt-6 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">Back to Menu</button>
                </div>
                <div className="mt-8 space-y-6"><h4 className="text-xl font-bold">Review Your Answers</h4>{questions.map((q, index) => <AnswerReview key={index} question={q} userAnswer={userAnswers[index]} index={index} />)}</div>
            </div>
        );
    }

    return null;
};

const AnswerReview: React.FC<{ question: PracticeQuestion, userAnswer: number | null, index: number }> = ({ question, userAnswer, index }) => {
    const isCorrect = userAnswer === question.correctAnswerIndex;
    return (
        <div className="p-4 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">{isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" /> : <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />}<p className="font-semibold flex-grow">{index + 1}. {question.question}</p></div>
            <div className="ml-9 mt-4 space-y-2 text-sm">
                {question.options.map((opt, optIndex) => {
                    const isUserAnswer = userAnswer === optIndex;
                    const isCorrectAnswer = question.correctAnswerIndex === optIndex;
                    let stateClass = '';
                    if (isCorrectAnswer) stateClass = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
                    else if (isUserAnswer && !isCorrectAnswer) stateClass = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
                    return <p key={optIndex} className={`p-2 rounded ${stateClass}`}>{String.fromCharCode(65 + optIndex)}. {opt}</p>
                })}
            </div>
            <div className="mt-4 ml-9 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md"><h5 className="font-semibold text-sm">Explanation</h5><p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{question.explanation}</p></div>
        </div>
    );
};

// --- Free Response Practice Component ---
const FreeResponsePractice: React.FC<{ exam: APExam; type: 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ'; onExit: () => void; }> = ({ exam, type, onExit }) => {
    const [status, setStatus] = useState<FRQStatus>('generating');
    const [question, setQuestion] = useState<FreeResponseQuestion | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleGenerateQuestion = useCallback(async () => {
        setStatus('generating');
        setError(null);
        try {
            const q = await generateFreeResponseQuestion(exam.title, type);
            setQuestion(q);
            setStatus('answering');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setStatus('error');
        }
    }, [exam.title, type]);

    React.useEffect(() => {
        handleGenerateQuestion();
    }, [handleGenerateQuestion]);

    const handleSubmitForGrading = async () => {
        if (!question || !userAnswer.trim()) return;
        setStatus('grading');
        try {
            const result = await gradeFreeResponseAnswer(exam.title, question.prompt, userAnswer, type);
            setFeedback(result);
            setStatus('review');
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setStatus('error');
        }
    };
    
    if (status === 'generating') return <div className="text-center p-12"><LoaderIcon className="w-12 h-12 mx-auto animate-spin text-primary-600" /><h3 className="mt-4 text-xl font-semibold">Generating Your {type} Prompt...</h3></div>;
    if (status === 'grading') return <div className="text-center p-12"><AcademicCapIcon className="w-12 h-12 mx-auto animate-bounce text-primary-600" /><h3 className="mt-4 text-xl font-semibold">AI Grader is Reviewing Your Answer...</h3></div>;
    if (status === 'error') return <div className="text-center p-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><XCircleIcon className="w-12 h-12 mx-auto text-red-500" /><h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-200">An Error Occurred</h3><p className="text-red-600 dark:text-red-300 mt-2">{error}</p><button onClick={onExit} className="mt-6 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">Back to Menu</button></div>;

    if (status === 'answering' && question) {
        return (
            <div>
                <h3 className="text-xl font-bold">{questionTypeDetails[type].name} Prompt</h3>
                <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: question.prompt.replace(/\n/g, '<br />') }} />
                {question.documents && (
                    <div className="mt-6">
                        <h4 className="font-semibold">Documents</h4>
                        <div className="mt-2 space-y-4">
                            {question.documents.map((doc, i) => (
                                <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Source: {doc.source}</p>
                                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{doc.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder="Type your response here..." rows={15} className="mt-6 w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <div className="mt-4 text-right"><button onClick={handleSubmitForGrading} disabled={!userAnswer.trim()} className="rounded-md bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 disabled:bg-slate-400 dark:disabled:bg-slate-600">Submit for AI Grading</button></div>
            </div>
        );
    }
    
    if (status === 'review') {
        return (
             <div>
                <h3 className="text-xl font-bold">AI Grader Feedback</h3>
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: feedback }} />
                <div className="mt-6 p-4 border-t border-slate-200 dark:border-slate-700">
                     <h4 className="font-semibold">Your Answer</h4>
                     <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{userAnswer}</p>
                </div>
                <div className="mt-6 text-center"><button onClick={onExit} className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500">Back to Menu</button></div>
            </div>
        )
    }

    return null;
};

// --- Main View Component ---
const APExamDetailView: React.FC = () => {
    const { examId } = useParams<{ examId: string }>();
    const exam = useMemo(() => AP_EXAMS.find(e => e.id === examId), [examId]);
    const [mode, setMode] = useState<PracticeMode>('menu');

    if (!exam) {
        return <div className="text-center"><h2 className="text-2xl font-bold">Exam not found</h2><Link to="/exams" className="mt-6 inline-block text-primary-600 hover:underline">Back to all exams</Link></div>;
    }

    const renderContent = () => {
        if (mode === 'menu') {
            return (
                <div className="text-center">
                    <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{exam.description}</p>
                     <div className="mt-10 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold mb-4">Choose a Practice Mode</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            {exam.questionTypes.length > 0 ? exam.questionTypes.map(type => (
                                <button key={type} onClick={() => setMode(type)} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-primary-600 dark:text-primary-400">{questionTypeDetails[type].name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{questionTypeDetails[type].description}</p>
                                </button>
                            )) : <p className="text-slate-500 col-span-full">No practice modules available for this subject.</p>}
                        </div>
                    </div>
                </div>
            );
        }
        
        if (mode === 'MCQ') {
            return <MCQPractice exam={exam} onExit={() => setMode('menu')} />;
        }
        
        if (['SAQ', 'DBQ', 'LEQ', 'FRQ'].includes(mode)) {
            return <FreeResponsePractice exam={exam} type={mode as 'SAQ' | 'DBQ' | 'LEQ' | 'FRQ'} onExit={() => setMode('menu')} />;
        }
    };
    
    return (
        <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-8">
                <Link to="/exams" className="text-sm text-primary-600 hover:underline">&larr; Back to all exams</Link>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">{exam.title}</h2>
                {mode !== 'menu' && (
                  <button onClick={() => setMode('menu')} className="text-sm text-slate-500 hover:underline mt-2">
                    &larr; Change practice mode
                  </button>
                )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg shadow-md p-6 md:p-8 min-h-[300px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default APExamDetailView;
