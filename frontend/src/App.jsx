import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AssessmentForm from "./pages/AssessmentForm";
import LoadingAnalysis from "./pages/LoadingAnalysis";
import ReportPage from "./pages/ReportPage";
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("landing");
  const [formData, setFormData] = useState({});
  const [reportData, setReportData] = useState(null);

  const navigate = (to, data = {}) => {
    if (to === "loading") setFormData(data);
    if (to === "report") setReportData(data);
    setPage(to);
  };

  return (
    <div className="app-root">
      {page === "landing" && <LandingPage onStart={() => navigate("form")} />}
      {page === "form" && <AssessmentForm onSubmit={(d) => navigate("loading", d)} />}
      {page === "loading" && <LoadingAnalysis formData={formData} onDone={(r) => navigate("report", r)} />}
      {page === "report" && <ReportPage data={reportData} onRetake={() => navigate("form")} />}
    </div>
  );
}
