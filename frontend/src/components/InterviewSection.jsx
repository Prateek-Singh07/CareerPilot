import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextareaAutosize, LinearProgress, Tooltip,
} from "@mui/material";
import {
  Mic, MicOff, VolumeUp, Send, Psychology,
} from "@mui/icons-material";
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

  // Timer reset is handled by the key={currentQuestion} on the AnimatePresence wrapper
  // which causes the component to re-mount with fresh state on each question.

  useEffect(() => {
    if (timeLeft <= 0) return;
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
  const timerColor = timeLeft <= 20 ? "#FF6B6B" : timeLeft <= 60 ? "#f59e0b" : "#22c55e";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Progress Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{
            display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                p: 1, borderRadius: 2,
                background: "rgba(108,99,255,0.1)",
                display: "flex",
              }}>
                <Psychology sx={{ color: "#6C63FF", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Question {currentQuestion} of {totalQuestions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(progress)}% complete
                </Typography>
              </Box>
            </Box>

            {/* Timer */}
            <Tooltip title={`${formatTime(timeLeft)} remaining`} arrow>
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 2, py: 1,
                borderRadius: 2,
                background: `${timerColor}10`,
                border: `1px solid ${timerColor}20`,
              }}>
                <Box sx={{
                  width: 8, height: 8, borderRadius: "50%",
                  bgcolor: timerColor,
                  animation: timeLeft <= 20 ? "pulse 1s infinite" : "none",
                }} />
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{
                    color: timerColor,
                    fontFamily: "monospace",
                    fontSize: "1.1rem",
                    lineHeight: 1,
                    letterSpacing: 1,
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ position: "relative", height: 6 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "rgba(108,99,255,0.08)",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #6C63FF, #00D4FF)",
                  borderRadius: 3,
                  transition: "transform 0.4s ease",
                },
              }}
            />
          </Box>
        </Box>

        {/* Question Card */}
        <motion.div
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Box sx={{
            p: { xs: 3, md: 4 },
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,255,0.03))",
            border: "1px solid rgba(108,99,255,0.15)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: 3,
              height: "100%",
              background: "linear-gradient(180deg, #6C63FF, #00D4FF)",
              borderRadius: "0 2px 2px 0",
            },
          }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>
              Interview Question
            </Typography>
            <Typography variant="body1" sx={{
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.8,
              color: "text.primary",
              fontWeight: 450,
            }}>
              {question}
            </Typography>
          </Box>
        </motion.div>

        {/* Answer Textarea */}
        <Box sx={{ position: "relative" }}>
          <TextareaAutosize
            minRows={5}
            maxRows={12}
            value={answer}
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 18px",
              fontSize: "1rem",
              fontFamily: "Inter, sans-serif",
              background: "rgba(255,255,255,0.03)",
              color: "#f0f0f5",
              border: feedback
                ? "1px solid rgba(108,99,255,0.3)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.7,
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6C63FF";
              e.target.style.background = "rgba(108,99,255,0.05)";
            }}
            onBlur={(e) => {
              if (!feedback) {
                e.target.style.borderColor = "rgba(255,255,255,0.08)";
                e.target.style.background = "rgba(255,255,255,0.03)";
              }
            }}
          />

          {/* Character count */}
          <Typography variant="caption"            color="text.disabled" sx={{
            position: "absolute",
            bottom: 12,
            right: 16,
            opacity: answer.length > 0 ? 0.6 : 0,
          }}>
            {answer.length} chars
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{
          display: "flex",
          gap: 1.5,
          mt: 2,
          mb: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          {/* Recording Button */}
          <Button
            variant={isRecording ? "contained" : "outlined"}
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <MicOff /> : <Mic />}
            onClick={isRecording ? stopRecording : startRecording}
            sx={{
              borderRadius: 10,
              borderColor: isRecording ? "transparent" : "rgba(255,255,255,0.1)",
              animation: isRecording ? "pulse 1.5s infinite" : "none",
              "&:hover": { borderColor: isRecording ? "transparent" : "#6C63FF" },
            }}
          >
            {isRecording ? "Stop Recording" : "Voice Input"}
          </Button>

          {/* Read Question Button */}
          <Button
            variant="outlined"
            startIcon={<VolumeUp />}
            onClick={() => {
              speechSynthesis.cancel();
              speechSynthesis.speak(new SpeechSynthesisUtterance(question));
            }}
            sx={{ borderRadius: 10, borderColor: "rgba(255,255,255,0.1)" }}
          >
            Read Question
          </Button>

          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <Box sx={{
                width: 8, height: 8, borderRadius: "50%",
                bgcolor: "#FF6B6B",
                animation: "pulse 0.8s infinite",
              }} />
              <Typography variant="caption" color="error" fontWeight={600}>
                Recording...
              </Typography>
            </motion.div>
          )}
        </Box>

        {/* Submit Button */}
        <motion.div
          whileHover={answer.trim() ? { scale: 1.01 } : {}}
          whileTap={answer.trim() ? { scale: 0.99 } : {}}
        >
          <Button
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !answer.trim()}
            onClick={submitAnswer}
            sx={{
              py: 1.5,
              fontSize: "1rem",
              borderRadius: 2,
              background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
              "&:disabled": {
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.2)",
              },
              "&:hover:not(:disabled)": {
                boxShadow: "0 8px 30px rgba(108,99,255,0.4)",
              },
            }}
          >
            <Send sx={{ mr: 1.5, fontSize: 18 }} />
            {loading ? "Evaluating..." : "Submit Answer"}
          </Button>
        </motion.div>

        {/* Feedback */}
        {feedback && (
          <FeedbackCard feedback={feedback} averageScore={averageScore} nextQuestion={nextQuestion} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
