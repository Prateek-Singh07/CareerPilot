import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextareaAutosize, LinearProgress, Tooltip, Chip, useTheme,
} from "@mui/material";
import {
  Mic, MicOff, VolumeUp, Send, Psychology,
} from "@mui/icons-material";
import FeedbackCard from "./FeedbackCard";

export default function InterviewSection({
  currentQuestion, totalQuestions, question, answer, setAnswer,
  submitAnswer, loading, feedback, averageScore, nextQuestion, isDemo = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const recognitionRef = useRef(null);
  const lastQuestionRef = useRef("");
  const [isRecording, setIsRecording] = useState(false);
  const TOTAL_TIME = 120;
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
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
    return () => {
      try { recognition.abort(); } catch {}
    };
  }, [setAnswer]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!question || lastQuestionRef.current === question) return;
    lastQuestionRef.current = question;
    try {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(question);
      speech.rate = 1; speech.pitch = 1; speech.volume = 1;
      window.speechSynthesis.speak(speech);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, [question]);

  const startRecording = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    try { recognitionRef.current?.start(); } catch { console.log("Already recording"); }
  };

  const stopRecording = () => recognitionRef.current?.stop();

  const formatTime = (s) => {
    if (s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = (currentQuestion / totalQuestions) * 100;
  const timerColor = timeLeft <= 20
    ? (isDark ? "#EF5350" : "#D32F2F")
    : timeLeft <= 60
    ? (isDark ? "#FFA726" : "#ED6C02")
    : (isDark ? "#81C784" : "#71866B");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.28 }}
      >
        {/* Progress Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)", color: "primary.main", display: "flex" }}>
                <Psychology sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body1" fontWeight={800} sx={{ color: "text.primary", lineHeight: 1.2 }}>
                    Question {currentQuestion} of {totalQuestions}
                  </Typography>
                  {isDemo && (
                    <Chip
                      label="Demo Mode"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1.5 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {Math.round(progress)}% of interview completed
                </Typography>
              </Box>
            </Box>

            {/* Timer */}
            <Tooltip title={`${formatTime(timeLeft)} remaining`} arrow>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 2, py: 0.8,
                borderRadius: 2.5,
                bgcolor: isDark ? "#2B2824" : "#FFFEFC",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(51, 44, 40, 0.03)",
              }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: timerColor }} />
                <Typography variant="body2" fontWeight={800} sx={{ color: timerColor, fontFamily: "monospace" }}>
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Progress Bar */}
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.06)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "primary.main",
                borderRadius: 3,
                transition: "transform 0.4s ease",
              },
            }}
          />
        </Box>

        {/* Question Card */}
        <Box sx={{
          p: { xs: 3, md: 4 },
          mb: 3,
          borderRadius: 3.5,
          bgcolor: "background.paper",
          border: `1px solid ${isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.18)"}`,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 4px 16px rgba(51, 44, 40, 0.04)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: "primary.main",
          },
        }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>
            Technical Interview Question
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", lineHeight: 1.6, fontSize: { xs: "1.05rem", md: "1.2rem" } }}>
            {question}
          </Typography>
        </Box>

        {/* Answer Textarea */}
        <Box sx={{ position: "relative", mb: 2 }}>
          <TextareaAutosize
            minRows={5}
            maxRows={12}
            value={answer}
            placeholder="Type your technical response here, explaining your approach clearly..."
            onChange={(e) => setAnswer(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 18px",
              fontSize: "0.98rem",
              fontFamily: "Inter, sans-serif",
              backgroundColor: isDark ? "#2B2824" : "#FFFEFC",
              color: isDark ? "#F3EEE8" : "#332C28",
              border: `1px solid ${isDark ? "#3A352F" : "rgba(51, 44, 40, 0.12)"}`,
              borderRadius: "14px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.6,
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(51, 44, 40, 0.02)",
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = theme.palette.primary.main; }}
            onBlur={(e) => { e.target.style.borderColor = isDark ? "#3A352F" : "rgba(51, 44, 40, 0.12)"; }}
          />

          <Typography variant="caption" sx={{
            position: "absolute", bottom: 12, right: 16,
            color: "text.secondary", opacity: answer.length > 0 ? 0.8 : 0,
          }}>
            {answer.length} characters
          </Typography>
        </Box>

        {/* Audio Controls */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant={isRecording ? "contained" : "outlined"}
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <MicOff /> : <Mic />}
            onClick={isRecording ? stopRecording : startRecording}
            sx={{
              borderRadius: 2.5,
              fontWeight: 700,
            }}
          >
            {isRecording ? "Stop Recording" : "Voice Input"}
          </Button>

          <Button
            variant="outlined"
            startIcon={<VolumeUp />}
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(question));
              }
            }}
            sx={{
              borderRadius: 2.5,
              borderColor: theme.palette.divider,
              color: "text.primary",
              fontWeight: 600,
              "&:hover": { borderColor: "secondary.main" },
            }}
          >
            Read Question Aloud
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setAnswer(
                "In asynchronous execution, I/O-bound operations such as database queries or network requests do not block the worker thread; the event loop continues processing other tasks while waiting. Synchronous execution processes sequentially and is best suited for compute-heavy tasks. In FastAPI, using async endpoints with non-blocking drivers maximizes concurrency."
              );
            }}
            sx={{
              borderRadius: 2.5,
              borderColor: isDark ? "rgba(217, 149, 115, 0.4)" : "rgba(185, 111, 80, 0.4)",
              color: "primary.main",
              fontWeight: 700,
              "&:hover": { borderColor: "primary.main", bgcolor: isDark ? "rgba(217, 149, 115, 0.1)" : "rgba(185, 111, 80, 0.08)" },
            }}
          >
            Insert Sample Answer
          </Button>

          {isRecording && (
            <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.5 }}>
              ● Recording voice response...
            </Typography>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={loading || !answer.trim()}
          onClick={submitAnswer}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: 2.5,
          }}
        >
          <Send sx={{ mr: 1, fontSize: 18 }} />
          {loading ? "Evaluating your answer..." : "Submit Answer for AI Scoring"}
        </Button>

        {/* Feedback Card */}
        {feedback && (
          <FeedbackCard feedback={feedback} averageScore={averageScore} nextQuestion={nextQuestion} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
