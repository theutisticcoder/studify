import React, { useState } from "react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline"; // If using Heroicons

const AP_EXAMS = [
  "AP Biology", "AP Calculus AB", "AP Calculus BC", // ...etc
];

export default function FullLengthExam() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  function handleStart() {
    // Integrate with your full-length exam logic here
    alert(`Start full-length exam for ${selectedExam}`);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center text-teal-700">
        <ClipboardDocumentListIcon className="w-7 h-7 mr-2" />
        Full-Length AP Exam Practice
      </h1>
      <label className="block mb-2 font-semibold">Choose an AP course:</label>
      <select
        className="w-full border p-2 rounded mb-6"
        value={selectedExam ?? ""}
        onChange={e => setSelectedExam(e.target.value)}
      >
        <option value="" disabled>Select AP Course</option>
        {AP_EXAMS.map(exam => (
          <option key={exam} value={exam}>{exam}</option>
        ))}
      </select>
      <button
        disabled={!selectedExam}
        className={`w-full px-4 py-2 rounded bg-teal-600 text-white font-bold transition shadow ${!selectedExam ? "opacity-50 cursor-not-allowed" : "hover:bg-teal-700"}`}
        onClick={handleStart}
      >
        Start Full-Length Exam
      </button>
    </div>
  );
}