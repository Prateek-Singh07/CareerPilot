import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, TextareaAutosize, LinearProgress, Chip } from "@mui/material";
import { Mic, MicOff, VolumeUp, Send, Psychology } from "@mui/icons-material";
import FeedbackCard from "./FeedbackCard";

export default function InterviewSection({
  currentQuestion, totalQuestions, question, answer, setAnswer,
  submitAnswer, loading, feedback, averageScore, nextQuestion,
}) {
  const recognitionRef = useRef(null);
  const lastQuestionRef = useRef("");
  const [isRecording, setIsRecording] = useState(false);
  const TOTAL_TIME = 120;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => { setTimeLeft(TOTAL_TIME); }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft <= 0) { alert("Time is up!"); return; }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = "en-US";
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => console.log("Speech Error:", event.error);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++)
        transcript += event.results[i][0].transcript;
      setAnswer(transcript);
    };
    recognitionRef.current = recognition;
  }, [setAnswer]);

  useEffect(() => {
    if (!question || lastQuestionRef.current === question) return;
    lastQuestionRef.current = question;
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(question);
    speech.rate = 1; speech.pitch = 1; speech.volume = 1;
    speechSynthesis.speak(speech);
  }, [question]);

  const startRecording = () => {
    speechSynthesis.cancel();
    try { recognitionRef.current?.start(); } catch (e) { console.log("Already recording"); }
  };

  const stopRecording = () => recognitionRef.current?.stop();

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const timerColor = timeLeft <= 20 ? "#FF6B6B" : timeLeft <= 60 ? "#f59e0b" : "#22c55e";

  return (
    <motion.div key={currentQuestion}
      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Psychology sx={{ color: "#6C63FF" }} />
            <Typography variant="h6" fontWeight={700}>Question {currentQuestion} of {totalQuestions}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: timerColor }} />
            <Typography variant="h6" fontWeight={700} sx={{ color: timerColor, fontFamily: "monospace" }}>{formatTime(timeLeft)}</Typography>
          </Box>
        </Box>
        <LinearProgress variant="determinate" value={(currentQuestion / totalQuestions) * 100}
          sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(108,99,255,0.1)",
            "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #6C63FF, #00D4FF)", borderRadius: 3 } }} />
      </Box>

      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
        <Box sx={{ p: 4, mb: 3, borderRadius: 4,
          background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,212,255,0.05))",
          border: "1px solid rgba(108,99,255,0.2)" }}>
          <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>{question}</Typography>
        </Box>
      </motion.div>

      <TextareaAutosize minRows={5} value={answer}
        placeholder="Type your answer here..."
        onChange={(e) => setAnswer(e.target.value)}
        style={{
          width: "100%", padding: "16px", fontSize: "1rem", fontFamily: "inherit",
          background: "rgba(255,255,255,0.03)", color: "#fff",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px",
          outline: "none", resize: "vertical", lineHeight: 1.6,
        }}
      />

      <Box sx={{ display: "flex", gap: 1, mt: 2, mb: 2, flexWrap: "wrap" }}>
        <Button variant={isRecording ? "contained" : "outlined"}
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <MicOff /> : <Mic />}
          onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        <Button variant="outlined" startIcon={<VolumeUp />}
          onClick={() => {
            speechSynthesis.cancel();
            speechSynthesis.speak(new SpeechSynthesisUtterance(question));
          }}>Read Question</Button>
      </Box>

      <Button variant="contained" fullWidth size="large" disabled={loading || !answer.trim()}
        onClick={submitAnswer}
        sx={{ py: 1.5, background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
          "&:disabled": { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" } }}>
        <Send sx={{ mr: 1 }} />
        {loading ? "Evaluating..." : "Submit Answer"}
      </Button>

      {feedback && (
        <FeedbackCard feedback={feedback} averageScore={averageScore} nextQuestion={nextQuestion} />
      )}
    </motion.div>
  );
}
