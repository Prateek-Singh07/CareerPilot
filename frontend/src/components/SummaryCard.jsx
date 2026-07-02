import axios from "axios";
import "./SummaryCard.css";

function SummaryCard({
  interviewSummary,
  resetInterview,
}) {

  const downloadReport = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/download-report",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "Interview_Report.pdf"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (err) {

      console.error(err);

      alert("Failed to download report.");

    }

  };

  return (

    <div className="summary-card fade">

      <h1>🎉 Interview Completed</h1>

      <h2>
        Average Score :
        {" "}
        {interviewSummary.average_score}/10
      </h2>

      <h3>
        Questions Answered :
        {" "}
        {interviewSummary.questions_answered}
        /
        {interviewSummary.total_questions}
      </h3>

      <br />

      <button
        onClick={downloadReport}
      >
        📄 Download Report
      </button>

      <br />
      <br />

      <button
        onClick={resetInterview}
      >
        Start New Interview
      </button>

    </div>

  );

}

export default SummaryCard;