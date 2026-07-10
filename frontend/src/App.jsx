import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import {
  Box, Container, Typography, Card, Button, IconButton,
  AppBar, Toolbar, Avatar, Chip
} from "@mui/material";
import { 
  Psychology, Description, AutoAwesome, TrendingUp, 
  RecordVoiceOver, Download, Security, Login as LoginIcon, Logout, History
} from "@mui/icons-material";

import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import HistoryPage from "./components/HistoryPage";
import UploadSection from "./components/UploadSection";
import InterviewSection from "./components/InterviewSection";
import SummaryCard from "./components/SummaryCard";
import LoadingScreen from "./components/LoadingScreen";
import ResumeMatch from "./components/ResumeMatch";
import api from "./services/api";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6C63FF' },
    secondary: { main: '#00D4FF' },
    background: { default: '#0a0a12', paper: '#1a1a2e' },
    text: { primary: '#ffffff', secondary: '#a0a0b8' },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 800 }, h2: { fontWeight: 700 }, h3: { fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12, padding: '10px 24px' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        },
      },
    },
  },
});

const features = [
  { icon: <Psychology sx={{ fontSize: 48 }} />, title: "AI Mock Interview",
    desc: "Practice technical interviews with AI-generated questions based on your resume. Get scored on 7 dimensions.",
    color: "#6C63FF", page: "interview" },
  { icon: <Description sx={{ fontSize: 48 }} />, title: "Resume Match Analyzer",
    desc: "Compare your resume against any job description. Get match percentage, missing skills, and improvement tips.",
    color: "#00D4FF", page: "resume" },
];

const stats = [
  { icon: <AutoAwesome />, value: "AI-Powered", label: "Gemini 2.5 Flash" },
  { icon: <RecordVoiceOver />, value: "Voice Support", label: "Speech-to-Text" },
  { icon: <Download />, value: "PDF Reports", label: "Detailed Analysis" },
  { icon: <Security />, value: "7 Metrics", label: "Comprehensive Scoring" },
];

function AppContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [started, setStarted] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const resetInterview = () => {
    setStarted(false); setInterviewSummary(null); setLoading(false);
  };

  const handleNav = (p) => {
    if (authLoading) return;
    if (p !== "home" && !isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setPage(p); resetInterview();
  };

  return (
    <Box className="bg-grid" sx={{ minHeight: "100vh", position: "relative" }}>
      <AppBar position="fixed" elevation={0} sx={{
        background: "rgba(10,10,18,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 0 } }}>
          <motion.div whileHover={{ scale: 1.05 }}
            style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onClick={() => { setPage("home"); resetInterview(); }}>
            <Avatar sx={{ bgcolor: "transparent", border: "2px solid #6C63FF", width: 36, height: 36 }}>
              <Psychology sx={{ color: "#6C63FF", fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700, background: "linear-gradient(135deg, #6C63FF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              SkillCortex
            </Typography>
          </motion.div>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {[
              { label: "Interview", page: "interview", icon: <Psychology sx={{ fontSize: 18 }} /> },
              { label: "Resume Match", page: "resume", icon: <Description sx={{ fontSize: 18 }} /> },
              { label: "History", page: "history", icon: <History sx={{ fontSize: 18 }} /> },
            ].map((item) => (
              <Button key={item.label} size="small" startIcon={item.icon}
                onClick={() => handleNav(item.page)}
                sx={{ color: page === item.page ? "#6C63FF" : "text.secondary", display: { xs: "none", sm: "flex" } }}>
                {item.label}
              </Button>
            ))}

            {isAuthenticated ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip avatar={<Avatar sx={{ bgcolor: "#6C63FF", width: 24, height: 24, fontSize: 12 }}>{user?.username?.[0]?.toUpperCase()}</Avatar>}
                  label={user?.username || "User"} variant="outlined" size="small"
                  sx={{ color: "text.secondary", borderColor: "rgba(255,255,255,0.1)", display: { xs: "none", md: "flex" } }} />
                <IconButton size="small" onClick={logout} sx={{ color: "text.secondary", "&:hover": { color: "#FF6B6B" } }}>
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <Button size="small" startIcon={<LoginIcon sx={{ fontSize: 18 }} />}
                onClick={() => setAuthOpen(true)}
                sx={{ color: "text.secondary" }}>
                Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onNavigate={handleNav} />
          </motion.div>
        )}
        {page === "interview" && (
          <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <InterviewFlow
              started={started} setStarted={setStarted}
              interviewSummary={interviewSummary} setInterviewSummary={setInterviewSummary}
              loading={loading} setLoading={setLoading}
              loadingText={loadingText} setLoadingText={setLoadingText}
              resetInterview={resetInterview}
              setAuthOpen={setAuthOpen}
            />
          </motion.div>
        )}
        {page === "resume" && (
          <motion.div key="resume" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
              <ResumeMatch />
            </Container>
          </motion.div>
        )}
        {page === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Container maxWidth="md" sx={{ py: 4 }}>
              <HistoryPage />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <Box component="footer" sx={{ textAlign: "center", py: 4, mt: 8, borderTop: "1px solid rgba(255,255,255,0.05)", color: "text.secondary", fontSize: 14 }}>
        <Typography variant="body2" color="text.secondary">Built with React + FastAPI + Gemini AI</Typography>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 4, px: { xs: 2, md: 0 } }}>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Psychology sx={{ fontSize: 64, color: "#6C63FF", mb: 2 }} />
          </motion.div>
          <Typography variant="h2" sx={{ fontWeight: 900, fontSize: { xs: "2rem", md: "3.5rem" }, mb: 2 }}>
            Master Every <Box component="span" className="gradient-text">Interview</Box>
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto", mb: 4, fontWeight: 400, fontSize: { xs: "1rem", md: "1.2rem" } }}>
            AI-powered interview preparation and resume analysis. Upload your resume, practice with AI, and get detailed feedback.
          </Typography>
          <Button variant="contained" size="large" onClick={() => onNavigate("interview")}
            sx={{ background: "linear-gradient(135deg, #6C63FF, #00D4FF)", px: 4, py: 1.5, fontSize: "1.1rem" }}>
            Get Started Free
          </Button>
        </Box>
      </motion.div>

      <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 1, md: 4 }, flexWrap: "wrap", mb: 8 }}>
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Card sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5, minWidth: 160 }}>
              <Box sx={{ color: "primary.main" }}>{stat.icon}</Box>
              <Box><Typography variant="body2" fontWeight={700}>{stat.value}</Typography><Typography variant="caption" color="text.secondary">{stat.label}</Typography></Box>
            </Card>
          </motion.div>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4 }}>
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.2 }}>
            <Card onClick={() => onNavigate(f.page)}
              sx={{ p: 4, cursor: "pointer", textAlign: "center",
                "&:hover": { borderColor: f.color, transform: "translateY(-8px)", boxShadow: `0 16px 48px ${f.color}20` },
                transition: "all 0.3s ease" }}>
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ color: f.color, marginBottom: 16 }}>{f.icon}</motion.div>
              <Chip label={f.title} size="small" sx={{ background: `${f.color}20`, color: f.color, mb: 2, fontWeight: 600 }} />
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>{f.desc}</Typography>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}

function InterviewFlow({ started, setStarted, interviewSummary, setInterviewSummary, loading, setLoading, loadingText, setLoadingText, resetInterview, setAuthOpen }) {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [averageScore, setAverageScore] = useState(0);
  const totalQuestions = 10;

  const uploadResume = async () => {
    if (!file) { alert("Please select a resume first."); return; }
    try {
      setLoading(true); setLoadingText("Analyzing Resume & Generating Questions...");
      const formData = new FormData(); formData.append("file", file);
      await api.post("/upload-resume", formData);
      setStarted(true); setInterviewSummary(null); setAverageScore(0);
      setFeedback(null); setAnswer(""); setCurrentQuestion(1);
      const q = await api.get("/next-question");
      setQuestion(q.data.question);
    } catch (err) {
      if (err.response?.status === 401) { setAuthOpen(true); return; }
      console.error(err); alert("Failed to upload resume.");
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (answer.trim() === "") { alert("Please type an answer."); return; }
    try {
      setLoading(true); setLoadingText("Evaluating Your Answer...");
      const res = await api.post("/answer", null, { params: { answer } });
      setFeedback(res.data.feedback); setAverageScore(res.data.average_score);
    } catch (err) {
      if (err.response?.status === 401) { setAuthOpen(true); return; }
      console.error(err); alert("Failed to evaluate answer.");
    } finally { setLoading(false); }
  };

  const nextQuestion = async () => {
    try {
      const res = await api.get("/next-question");
      if (res.data.message) { setInterviewSummary(res.data.summary); setStarted(false); return; }
      setQuestion(res.data.question); setAnswer(""); setFeedback(null);
      setCurrentQuestion((prev) => prev + 1);
    } catch (err) {
      if (err.response?.status === 401) { setAuthOpen(true); return; }
      console.error(err); alert("Failed to fetch next question.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading && <LoadingScreen text={loadingText} />}
      {!loading && !started && !interviewSummary && (
        <UploadSection setFile={setFile} uploadResume={uploadResume} />
      )}
      {started && (
        <InterviewSection
          currentQuestion={currentQuestion} totalQuestions={totalQuestions}
          question={question} answer={answer} setAnswer={setAnswer}
          submitAnswer={submitAnswer} loading={loading}
          feedback={feedback} averageScore={averageScore} nextQuestion={nextQuestion}
        />
      )}
      {!loading && interviewSummary && (
        <SummaryCard interviewSummary={interviewSummary} resetInterview={resetInterview} />
      )}
    </Container>
  );
}
