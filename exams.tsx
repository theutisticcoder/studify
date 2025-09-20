import { useState } from "react";
import { generateFullExam } from "../utils/generateFullExam";
import { FullExam } from "../types";
import { useNavigate } from "react-router-dom";

export default function ExamsPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGenerateExam(subject: string) {
    setLoading(true);
    try {
      const exam: FullExam = await generateFullExam(subject);
      navigate("/full-exam", { state: { exam } });
    } catch (err) {
      console.error(err);
      alert("Could not generate exam");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Exams</h1>
      <button onClick={() => handleGenerateExam("Biology")} disabled={loading}>
        {loading ? "Generating..." : "Generate AP Biology Exam"}
      </button>
    </div>
  );
}