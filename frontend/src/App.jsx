import { useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";

import "./App.css";

import UploadSection from "./components/UploadSection";
import InterviewSection from "./components/InterviewSection";
import SummaryCard from "./components/SummaryCard";
import LoadingScreen from "./components/LoadingScreen";
import ResumeMatch from "./components/ResumeMatch";

function App() {
  const [page, setPage] = useState("home");

  const [file, setFile] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [feedback, setFeedback] = useState(null);

  const [started, setStarted] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(1);

  const totalQuestions = 10;

  const [averageScore, setAverageScore] = useState(0);

  const [interviewSummary, setInterviewSummary] = useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingText, setLoadingText] = useState("");

  const uploadResume = async () => {
    if (!file) {
      alert("Select a resume first.");
      return;
    }

    try {
      setLoading(true);
      setLoadingText(
        "Analyzing Resume and Generating Interview Questions..."
      );

      const formData = new FormData();

      formData.append("file", file);

      await axios.post(
        "http://127.0.0.1:8000/upload-resume",
        formData
      );

      setStarted(true);
      setInterviewSummary(null);
      setAverageScore(0);
      setFeedback(null);
      setAnswer("");
      setCurrentQuestion(1);

      const q = await axios.get(
        "http://127.0.0.1:8000/next-question"
      );

      setQuestion(q.data.question);
    } catch (err) {
      console.error(err);

      alert("Failed to upload resume.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (answer.trim() === "") {
      alert("Please type an answer.");
      return;
    }

    try {
      setLoading(true);
      setLoadingText("Evaluating Your Answer...");

      const res = await axios.post(
        "http://127.0.0.1:8000/answer",
        null,
        {
          params: {
            answer,
          },
        }
      );

      setFeedback(res.data.feedback);
      setAverageScore(res.data.average_score);
    } catch (err) {
      console.error(err);

      alert("Failed to evaluate answer.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/next-question"
      );

      if (res.data.message) {
        setInterviewSummary(res.data.summary);
        setStarted(false);
        return;
      }

      setQuestion(res.data.question);
      setAnswer("");
      setFeedback(null);

      setCurrentQuestion((prev) => prev + 1);
    } catch (err) {
      console.error(err);

      alert("Failed to fetch next question.");
    }
  };
    const resetInterview = () => {
    setInterviewSummary(null);
    setStarted(false);
    setFile(null);
    setQuestion("");
    setAnswer("");
    setFeedback(null);
    setAverageScore(0);
    setCurrentQuestion(1);
    setLoading(false);
  };

  return (
    <div className="app fade">

      {page === "home" && (
        <div
          style={{
            textAlign: "center",
            marginTop: "60px",
          }}
        >
          <h1>🤖 AI Career Assistant</h1>

          <p>
            Choose one of the tools below.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              marginTop: "40px",
              flexWrap: "wrap",
            }}
          >

            <div
              onClick={() => setPage("interview")}
              style={{
                width: "300px",
                padding: "30px",
                background: "#1f2937",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              <h2>🎤 AI Mock Interview</h2>

              <p>
                Practice technical interviews with AI.
              </p>
            </div>

            <div
              onClick={() => setPage("resume")}
              style={{
                width: "300px",
                padding: "30px",
                background: "#1f2937",
                borderRadius: "15px",
                cursor: "pointer",
                transition: "0.3s",
              }}
            >
              <h2>📄 Resume Match Analyzer</h2>

              <p>
                Compare your resume against any job description.
              </p>
            </div>

          </div>

        </div>
      )}

      {page === "interview" && (
        <>

          {loading && (
            <LoadingScreen
              text={loadingText}
            />
          )}

          {!loading && !started && !interviewSummary && (
            <UploadSection
              setFile={setFile}
              uploadResume={uploadResume}
            />
          )}

          {started && (
            <InterviewSection
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
              question={question}
              answer={answer}
              setAnswer={setAnswer}
              submitAnswer={submitAnswer}
              loading={loading}
              feedback={feedback}
              averageScore={averageScore}
              nextQuestion={nextQuestion}
            />
          )}

          {!loading && interviewSummary && (
            <>
              <Confetti
                recycle={false}
                numberOfPieces={350}
              />

              <SummaryCard
                interviewSummary={interviewSummary}
                resetInterview={resetInterview}
              />
            </>
          )}

          <br />

          <button
            onClick={() => {
              resetInterview();
              setPage("home");
            }}
            style={{
              padding: "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ⬅ Back to Home
          </button>

        </>
      )}

      {page === "resume" && (
        <>

          <ResumeMatch />

          <br />

          <button
            onClick={() => setPage("home")}
            style={{
              padding: "12px 25px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            ⬅ Back to Home
          </button>

        </>
      )}

    </div>
  );
}

export default App;