import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AssessmentForm from "./pages/AssessmentForm";
import LoadingAnalysis from "./pages/LoadingAnalysis";
import ReportPage from "./pages/ReportPage";

export default function App() {

  const [page, setPage] = useState("landing");
  const [formData, setFormData] = useState(null);
  const [report, setReport] = useState(null);

  const handleStart = () => {
    setPage("form");
  };

 const handleSubmit = async (data) => {
    setFormData(data);
    setPage("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const text = await res.text();
      console.log("Response:", text);
      const result = JSON.parse(text);
      setReport(result);
      setPage("report");
    } catch (e) {
      console.error("Error:", e);
      alert("Error: " + e.message);
      setPage("form");
    }
  };

  const handleReset = () => {
    setPage("landing");
    setFormData(null);
    setReport(null);
  };

  return (
    <>
      {page === "landing" && (
        <LandingPage onStart={handleStart} />
      )}

      {page === "form" && (
        <AssessmentForm onSubmit={handleSubmit} />
      )}

      {page === "loading" && (
        <LoadingAnalysis />
      )}

      {page === "report" && report && (
        <ReportPage report={report} onReset={handleReset} />
      )}
    </>
  );
}