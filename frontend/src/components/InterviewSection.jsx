import { useEffect, useRef, useState } from "react";
import "./InterviewSection.css";
import FeedbackCard from "./FeedbackCard";
import Timer from "./Timer";

function InterviewSection({
  currentQuestion,
  totalQuestions,
  question,
  answer,
  setAnswer,
  submitAnswer,
  loading,
  feedback,
  averageScore,
  nextQuestion,
}) {

  const recognitionRef = useRef(null);
  const lastQuestionRef = useRef("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

   const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.lang = "en-US";

    recognition.onstart = () => {

    console.log("🎤 Recording Started");

    setIsRecording(true);

};

recognition.onend = () => {

    console.log("🛑 Recording Stopped");

    setIsRecording(false);

};

recognition.onerror = (event) => {
    console.log("Speech Error:", event.error);
};

recognition.onresult = (event) => {

    console.log(event);

    let transcript = "";

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {
        transcript += event.results[i][0].transcript;
    }

    console.log("Transcript:", transcript);

    setAnswer(transcript);
};

    recognitionRef.current = recognition;

  }, [setAnswer]);

  useEffect(() => {

    if (!question) return;

    if (lastQuestionRef.current === question) return;

    lastQuestionRef.current = question;

    speechSynthesis.cancel();

    const speech =
      new SpeechSynthesisUtterance(question);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speechSynthesis.speak(speech);

}, [question]);

  const startRecording = () => {

    speechSynthesis.cancel();

    try {
        recognitionRef.current?.start();
    } catch (e) {
        console.log("Already recording");
    }

};

  const stopRecording = () => {

    recognitionRef.current?.stop();

  };

  const handleTimeUp = () => {

    alert("⏰ Time is up!");

  };

  return (
    <div className="fade">

      <h2>
        Question {currentQuestion} of {totalQuestions}
      </h2>

      <Timer
        currentQuestion={currentQuestion}
        onTimeUp={handleTimeUp}
      />

      <div className="progress">

        <div
          className="progress-fill"
          style={{
            width: `${(currentQuestion / totalQuestions) * 100}%`,
          }}
        />

      </div>

      <div className="question-card">
        {question}
      </div>

      <textarea
        rows="8"
        value={answer}
        placeholder="Type or speak your answer..."
        onChange={(e) => setAnswer(e.target.value)}
      />

      <div className="voice-buttons">

        <button
    disabled={isRecording}
    onClick={startRecording}
>
    {isRecording
        ? "🎤 Recording..."
        : "🎤 Start Recording"}
</button>

        <button
    disabled={!isRecording}
    onClick={stopRecording}
>
    ⏹ Stop Recording
</button>

        <button
          onClick={() => {

            speechSynthesis.cancel();

            speechSynthesis.speak(
              new SpeechSynthesisUtterance(question)
            );

          }}
        >
          🔊 Read Again
        </button>

      </div>

      <button
        className="submit-btn"
        disabled={loading}
        onClick={submitAnswer}
      >
        {loading
          ? "Evaluating..."
          : "Submit Answer"}
      </button>

      {feedback && (
        <FeedbackCard
          feedback={feedback}
          averageScore={averageScore}
          nextQuestion={nextQuestion}
        />
      )}

    </div>
  );
}

export default InterviewSection;