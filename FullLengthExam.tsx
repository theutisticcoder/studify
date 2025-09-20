import { useLocation } from "react-router-dom";
import { useState } from "react";
import { FullExam, Question } from "../types";

export default function FullLengthExam() {
  const location = useLocation();
  const exam: FullExam = location.state?.exam;

  const [currentSection, setCurrentSection] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  if (!exam) return <p>No exam loaded.</p>;

  const section = exam.sections[currentSection];
  const question = section.questions[currentQ];

  function handleAnswer(q: Question, ans: number | string) {
    setAnswers((prev) => ({ ...prev, [q.id]: ans }));
  }

  return (
    <div>
      <h1>{exam.examTitle}</h1>
      <h2>{section.sectionTitle}</h2>
      <p>{question.questionText}</p>

      {question.options ? (
        <div>
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(question, idx)}
              style={{
                backgroundColor: answers[question.id] === idx ? "#ddd" : "",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={(answers[question.id] as string) || ""}
          onChange={(e) => handleAnswer(question, e.target.value)}
        />
      )}

      <div>
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
        >
          Previous
        </button>
        <button
          disabled={currentQ === section.questions.length - 1}
          onClick={() => setCurrentQ((q) => q + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}