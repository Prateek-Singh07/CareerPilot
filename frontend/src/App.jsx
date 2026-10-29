import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Container, Typography, Card, Button, IconButton,
  AppBar, Toolbar, Avatar, Chip, useMediaQuery, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
  Tooltip, Alert, useTheme,
} from "@mui/material";
import {
  Psychology, Description, AutoAwesome, TrendingUp,
  Map, History, Logout, Login as LoginIcon, Menu as MenuIcon,
  Close, ArrowForward, School, CheckCircle, LightMode, DarkMode, Person,
} from "@mui/icons-material";

import { ThemeCustomProvider, useColorMode } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import HistoryPage from "./components/HistoryPage";
import UploadSection from "./components/UploadSection";
import InterviewSection from "./components/InterviewSection";
import SummaryCard from "./components/SummaryCard";
import LoadingScreen from "./components/LoadingScreen";
import ResumeMatch from "./components/ResumeMatch";
import CareerRoadmap from "./components/CareerRoadmap";
import CareerProfile from "./components/CareerProfile";
import api from "./services/api";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

const navItems = [
  { label: "Dashboard", page: "dashboard", icon: <TrendingUp sx={{ fontSize: 18 }} /> },
  { label: "Profile", page: "profile", icon: <Person sx={{ fontSize: 18 }} /> },
  { label: "Mock Interview", page: "interview", icon: <Psychology sx={{ fontSize: 18 }} /> },
  { label: "Resume Match", page: "resume", icon: <Description sx={{ fontSize: 18 }} /> },
  { label: "Career Roadmap", page: "roadmap", icon: <Map sx={{ fontSize: 18 }} /> },
  { label: "History", page: "history", icon: <History sx={{ fontSize: 18 }} /> },
];

function AppContent() {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const isDark = mode === "dark";
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [page, setPage] = useState("dashboard");
  const [started, setStarted] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Presentation Demo Mode state persisted in localStorage
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem("careerpilot_demo_mode") === "true";
  });

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem("careerpilot_demo_mode", next ? "true" : "false");
  };

  const resetInterview = () => {
    setStarted(false);
    setInterviewSummary(null);
    setLoading(false);
  };

  const handleNav = (p) => {
    setMobileDrawerOpen(false);
    if (authLoading) return;
    if (p !== "home" && !isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setPage(p);
    resetInterview();
  };

  return (
    <Box className="bg-warm-pattern" sx={{ minHeight: "100vh", position: "relative", bgcolor: "background.default", color: "text.primary" }}>
      {/* Soft Ambient Accents */}
      <Box className="glow-warm glow-terracotta" sx={{ top: "-10%", left: "-5%", width: 480, height: 480 }} />
      <Box className="glow-warm glow-sage" sx={{ bottom: "-10%", right: "-5%", width: 520, height: 520 }} />

      {/* ── Top Navigation Bar ── */}
      <AppBar position="fixed" elevation={0} sx={{
        background: isDark ? "rgba(23, 22, 20, 0.92)" : "rgba(248, 246, 242, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: "text.primary",
        transition: "background-color 220ms ease, border-color 220ms ease",
      }}>
        <Toolbar sx={{ maxWidth: 1240, width: "100%", mx: "auto", px: { xs: 2, md: 3 } }}>
          {/* Brand Logo */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.2, cursor: "pointer", mr: 2 }}
            onClick={() => handleNav(isAuthenticated ? "dashboard" : "home")}
          >
            <Avatar sx={{
              bgcolor: "primary.main",
              width: 36, height: 36,
              boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.5)" : "0 2px 8px rgba(185, 111, 80, 0.35)",
            }}>
              <Psychology sx={{ color: isDark ? "#171614" : "#FFFFFF", fontSize: 20 }} />
            </Avatar>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              fontSize: "1.18rem",
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}>
              CareerPilot <Box component="span" sx={{ color: "primary.main" }}>AI</Box>
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* Desktop Navigation Links */}
          {!isMobile && isAuthenticated && (
            <Box sx={{ display: "flex", gap: 0.8, alignItems: "center", mr: 2 }}>
              {navItems.map((item) => {
                const isActive = page === item.page;
                return (
                  <Button
                    key={item.page}
                    size="small"
                    startIcon={item.icon}
                    onClick={() => handleNav(item.page)}
                    sx={{
                      color: isActive ? "primary.main" : "text.secondary",
                      fontWeight: isActive ? 800 : 600,
                      bgcolor: isActive ? (isDark ? "rgba(217, 149, 115, 0.12)" : "rgba(185, 111, 80, 0.08)") : "transparent",
                      borderRadius: 2.5,
                      px: 1.6,
                      "&:hover": {
                        bgcolor: isDark ? "rgba(217, 149, 115, 0.08)" : "rgba(185, 111, 80, 0.06)",
                        color: "primary.main",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Actions: Demo Mode + Theme Toggle + User Info / Login */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            {/* Presentation Demo Mode Toggle Chip */}
            <Tooltip
              title={
                demoMode
                  ? "Presentation Demo Mode is ACTIVE: All 4 AI features operate with realistic sample data without consuming live API quota."
                  : "Enable Presentation Demo Mode to demonstrate AI features reliably without live API calls."
              }
              arrow
            >
              <Chip
                icon={<AutoAwesome sx={{ fontSize: "14px !important", color: demoMode ? "#E65100" : "inherit" }} />}
                label={demoMode ? "Demo Mode ON" : "Demo Mode"}
                size="small"
                onClick={toggleDemoMode}
                clickable
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  borderRadius: 2,
                  bgcolor: demoMode
                    ? (isDark ? "rgba(255, 167, 38, 0.2)" : "rgba(237, 108, 2, 0.15)")
                    : (isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(51, 44, 40, 0.05)"),
                  color: demoMode ? (isDark ? "#FFA726" : "#E65100") : "text.secondary",
                  border: `1px solid ${demoMode ? (isDark ? "#FFA726" : "#ED6C02") : theme.palette.divider}`,
                  transition: "all 200ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              />
            </Tooltip>

            {/* Theme Toggle Button */}
            <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton
                size="small"
                onClick={toggleColorMode}
                aria-label="Toggle light/dark theme"
                sx={{
                  color: "text.primary",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(51, 44, 40, 0.05)",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 0.9,
                  borderRadius: 2.5,
                  transition: "all 200ms ease",
                  "&:hover": {
                    color: "primary.main",
                    borderColor: "primary.main",
                    bgcolor: isDark ? "rgba(217, 149, 115, 0.12)" : "rgba(185, 111, 80, 0.08)",
                  },
                }}
              >
                {isDark ? <LightMode sx={{ fontSize: 18 }} /> : <DarkMode sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>

            {isAuthenticated ? (
              <>
                <Chip
                  avatar={
                    <Avatar sx={{ bgcolor: "secondary.main", width: 26, height: 26, fontSize: 12, fontWeight: 700, color: isDark ? "#171614" : "#FFFFFF" }}>
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </Avatar>
                  }
                  label={user?.username || "Candidate"}
                  size="small"
                  onClick={() => handleNav("profile")}
                  clickable
                  sx={{
                    bgcolor: page === "profile" ? (isDark ? "rgba(217, 149, 115, 0.2)" : "rgba(185, 111, 80, 0.15)") : (isDark ? "rgba(255, 255, 255, 0.05)" : "#F0EBE4"),
                    color: "text.primary",
                    fontWeight: 700,
                    border: `1px solid ${page === "profile" ? "primary.main" : theme.palette.divider}`,
                    display: { xs: "none", sm: "flex" },
                    cursor: "pointer",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={logout}
                  title="Sign Out"
                  sx={{
                    color: "text.secondary",
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F0EBE4",
                    "&:hover": { color: "error.main", bgcolor: "rgba(211, 47, 47, 0.12)" },
                  }}
                >
                  <Logout sx={{ fontSize: 18 }} />
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setAuthOpen(true)}
                  sx={{ borderColor: theme.palette.divider, color: "text.primary" }}
                >
                  Log In
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setAuthOpen(true)}
                  sx={{ bgcolor: "primary.main", color: isDark ? "#171614" : "#FFFFFF" }}
                >
                  Get Started
                </Button>
              </Box>
            )}

            {isMobile && (
              <IconButton size="small" onClick={() => setMobileDrawerOpen(true)} sx={{ color: "text.primary", ml: 0.5 }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            bgcolor: "background.paper",
            borderLeft: `1px solid ${theme.palette.divider}`,
            p: 2.5,
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
            CareerPilot AI
          </Typography>
          <IconButton size="small" onClick={() => setMobileDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        {/* Presentation Demo in drawer */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          mb: 1.5,
          borderRadius: 2.5,
          bgcolor: demoMode
            ? (isDark ? "rgba(255, 167, 38, 0.15)" : "rgba(237, 108, 2, 0.12)")
            : (isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(51, 44, 40, 0.04)"),
          border: `1px solid ${demoMode ? (isDark ? "#FFA726" : "#ED6C02") : theme.palette.divider}`,
        }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: "text.primary" }}>
            Presentation Demo
          </Typography>
          <Chip
            label={demoMode ? "ON" : "OFF"}
            size="small"
            color={demoMode ? "warning" : "default"}
            onClick={toggleDemoMode}
            sx={{ fontWeight: 700, cursor: "pointer" }}
          />
        </Box>

        {/* Theme mode in drawer */}
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          mb: 2,
          borderRadius: 2.5,
          bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(51, 44, 40, 0.04)",
          border: `1px solid ${theme.palette.divider}`,
        }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: "text.primary" }}>
            {isDark ? "Dark Theme" : "Light Theme"}
          </Typography>
          <IconButton size="small" onClick={toggleColorMode} sx={{ color: "primary.main" }}>
            {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>
        </Box>

        <List sx={{ px: 0 }}>
          {navItems.map((item) => (
            <ListItem key={item.page} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNav(item.page)}
                sx={{
                  borderRadius: 2,
                  bgcolor: page === item.page ? (isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)") : "transparent",
                  color: page === item.page ? "primary.main" : "text.primary",
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {isAuthenticated && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={logout}
              sx={{ borderRadius: 2 }}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Drawer>

      {/* Top Spacer for fixed AppBar */}
      <Toolbar sx={{ mb: { xs: 2, md: 3 } }} />

      {/* ── Main Viewports ── */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
        <AnimatePresence mode="wait">
          {page === "home" && !isAuthenticated && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <LandingPage onNavigate={handleNav} />
            </motion.div>
          )}
          {page === "dashboard" && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard onNavigate={handleNav} />
            </motion.div>
          )}
          {page === "profile" && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Container maxWidth="md" sx={{ py: 2 }}>
                <CareerProfile onNavigate={handleNav} />
              </Container>
            </motion.div>
          )}
          {page === "interview" && (
            <motion.div key="interview" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <InterviewFlow
                started={started} setStarted={setStarted}
                interviewSummary={interviewSummary} setInterviewSummary={setInterviewSummary}
                loading={loading} setLoading={setLoading}
                loadingText={loadingText} setLoadingText={setLoadingText}
                resetInterview={resetInterview}
                setAuthOpen={setAuthOpen}
                demoMode={demoMode}
                setDemoMode={setDemoMode}
              />
            </motion.div>
          )}
          {page === "resume" && (
            <motion.div key="resume" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Container maxWidth="md" sx={{ py: 2 }}>
                <ResumeMatch />
              </Container>
            </motion.div>
          )}
          {page === "roadmap" && (
            <motion.div key="roadmap" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Container maxWidth="md" sx={{ py: 2 }}>
                <CareerRoadmap />
              </Container>
            </motion.div>
          )}
          {page === "history" && (
            <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Container maxWidth="md" sx={{ py: 2 }}>
                <HistoryPage />
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* ── Footer ── */}
      <Box component="footer" sx={{
        mt: 8,
        py: 3.5,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? "rgba(34, 32, 29, 0.6)" : "#F0EBE4",
        transition: "background-color 220ms ease, border-color 220ms ease",
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.25,
            width: "100%",
            textAlign: "center",
          }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
              <Psychology sx={{ fontSize: 18, color: isDark ? "#171614" : "#FFFFFF" }} />
            </Avatar>
            <Typography variant="body2" fontWeight={800} sx={{ color: "text.primary", letterSpacing: 0.3 }}>
              CareerPilot AI
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeCustomProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeCustomProvider>
  );
}

/* ═══════════════════════ LANDING PAGE ═══════════════════════ */

function LandingPage({ onNavigate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
      {/* Badge */}
      <Box sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 0.8,
        borderRadius: 4,
        bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
        color: "primary.main",
        fontWeight: 700,
        fontSize: "0.85rem",
        mb: 3,
        border: `1px solid ${isDark ? "rgba(217, 149, 115, 0.3)" : "rgba(185, 111, 80, 0.25)"}`,
      }}>
        <AutoAwesome sx={{ fontSize: 16 }} />
        AI-Powered Career & Interview Platform
      </Box>

      {/* Hero Headline */}
      <Typography
        variant="h1"
        sx={{
          fontWeight: 900,
          fontSize: { xs: "2.3rem", sm: "3.2rem", md: "4rem" },
          color: "text.primary",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          maxWidth: 820,
          mx: "auto",
          mb: 2.5,
        }}
      >
        Accelerate Your Career with{" "}
        <Box component="span" sx={{
          color: "primary.main",
          position: "relative",
          display: "inline-block",
        }}>
          Intelligent AI Coaching
        </Box>
      </Typography>

      {/* Subhead */}
      <Typography
        variant="h6"
        sx={{
          color: "text.secondary",
          fontSize: { xs: "1rem", md: "1.2rem" },
          fontWeight: 400,
          maxWidth: 620,
          mx: "auto",
          mb: 4.5,
          lineHeight: 1.6,
        }}
      >
        Practice technical mock interviews tailored to your resume, optimize for ATS filters, and follow a personalized engineering learning roadmap.
      </Typography>

      {/* Call to Actions */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap", mb: 8 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          onClick={() => onNavigate("interview")}
          sx={{
            px: 4,
            py: 1.6,
            fontSize: "1.05rem",
            fontWeight: 800,
            borderRadius: 3,
            bgcolor: "primary.main",
            color: isDark ? "#171614" : "#FFFFFF",
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 16px rgba(185, 111, 80, 0.3)",
          }}
        >
          Start Mock Interview
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<Map />}
          onClick={() => onNavigate("roadmap")}
          sx={{
            px: 3.5,
            py: 1.6,
            fontSize: "1.05rem",
            fontWeight: 700,
            borderRadius: 3,
            borderColor: theme.palette.divider,
            color: "text.primary",
          }}
        >
          Explore Career Roadmap
        </Button>
      </Box>

      {/* Feature Value Cards */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
        gap: 3,
        textAlign: "left",
      }}>
        <Card sx={{ p: 3.5, borderRadius: 3.5 }}>
          <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)", color: "primary.main", mb: 2 }}>
            <Psychology sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", mb: 1 }}>
            Resume-Tailored Questions
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            Upload your resume and receive 10 technical interview questions generated dynamically to test your claimed skills.
          </Typography>
        </Card>

        <Card sx={{ p: 3.5, borderRadius: 3.5 }}>
          <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.14)", color: "secondary.main", mb: 2 }}>
            <Description sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", mb: 1 }}>
            ATS Resume Matcher
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            Paste any job specification and discover keyword alignment, missing skills, and tailored suggestions to boost candidate interview callbacks.
          </Typography>
        </Card>

        <Card sx={{ p: 3.5, borderRadius: 3.5 }}>
          <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)", color: "primary.main", mb: 2 }}>
            <Map sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", mb: 1 }}>
            AI Learning Roadmap
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            Set your target role and study availability. Receive a sequential learning plan with project ideas, timelines, and actionable weekly milestones.
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

/* ═══════════════════════ INTERVIEW FLOW ═══════════════════════ */

function InterviewFlow({
  started, setStarted,
  interviewSummary, setInterviewSummary,
  loading, setLoading,
  loadingText, setLoadingText,
  resetInterview, setAuthOpen,
  demoMode, setDemoMode,
}) {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [averageScore, setAverageScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [isDemoSession, setIsDemoSession] = useState(false);
  const [flowError, setFlowError] = useState("");
  const [isRateLimit, setIsRateLimit] = useState(false);
  const [retryFn, setRetryFn] = useState(null);

  const handleError = (err, retryAction = null) => {
    if (err.response?.status === 401) { setAuthOpen(true); return; }
    const status = err.response?.status;
    const detail = err.response?.data?.detail || "";
    if (status === 429 || /rate|quota|limit|exhaust/i.test(detail)) {
      setIsRateLimit(true);
      setFlowError("AI service is temporarily unavailable because its request limit has been reached. You can retry later or use Demo Mode to explore this feature.");
    } else {
      setIsRateLimit(false);
      setFlowError(detail || "An unexpected error occurred. Please try again or switch to Demo Mode.");
    }
    setRetryFn(() => retryAction);
  };

  const uploadResume = async (forceDemo = false) => {
    if (!file) {
      setFlowError("Please select a resume first.");
      setIsRateLimit(false);
      return;
    }
    setFlowError("");
    setIsRateLimit(false);
    try {
      setLoading(true);
      setLoadingText("Analyzing your resume and preparing interview questions...");
      const formData = new FormData();
      formData.append("file", file);
      const isClientDemo = forceDemo || demoMode || localStorage.getItem("careerpilot_demo_mode") === "true";
      const uploadRes = await api.post("/upload-resume", formData, {
        params: isClientDemo ? { demo: true } : {},
      });
      if (uploadRes.data?.total_questions) {
        setTotalQuestions(uploadRes.data.total_questions);
      }
      setIsDemoSession(Boolean(uploadRes.data?.is_demo || isClientDemo));
      setStarted(true);
      setInterviewSummary(null);
      setAverageScore(0);
      setFeedback(null);
      setAnswer("");
      setCurrentQuestion(1);
      const q = await api.get("/next-question");
      setQuestion(q.data.question);
      if (q.data?.is_demo) setIsDemoSession(true);
    } catch (err) {
      console.error(err);
      handleError(err, () => uploadResume(forceDemo));
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (forceDemo = false) => {
    if (answer.trim() === "") {
      setFlowError("Please enter your answer before submitting.");
      setIsRateLimit(false);
      return;
    }
    setFlowError("");
    setIsRateLimit(false);
    try {
      setLoading(true);
      setLoadingText("Evaluating your answer...");
      const isClientDemo = forceDemo || isDemoSession || demoMode || localStorage.getItem("careerpilot_demo_mode") === "true";
      const res = await api.post("/answer", null, {
        params: { answer, ...(isClientDemo ? { demo: true } : {}) },
      });
      setFeedback(res.data.feedback);
      setAverageScore(res.data.average_score);
      if (res.data?.is_demo) setIsDemoSession(true);
    } catch (err) {
      console.error(err);
      handleError(err, () => submitAnswer(forceDemo));
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    setFlowError("");
    setIsRateLimit(false);
    try {
      const res = await api.get("/next-question");
      if (res.data.message) {
        setInterviewSummary(res.data.summary);
        setStarted(false);
        return;
      }
      setQuestion(res.data.question);
      setAnswer("");
      setFeedback(null);
      setCurrentQuestion((prev) => prev + 1);
      if (res.data?.is_demo) setIsDemoSession(true);
    } catch (err) {
      console.error(err);
      handleError(err, () => nextQuestion());
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      {flowError && (
        <Alert
          severity={isRateLimit ? "warning" : "error"}
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {isRateLimit && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    localStorage.setItem("careerpilot_demo_mode", "true");
                    if (setDemoMode) setDemoMode(true);
                    setFlowError("");
                    setIsDemoSession(true);
                    if (retryFn) retryFn(true);
                  }}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Switch to Demo Mode
                </Button>
              )}
              {retryFn && (
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => {
                    setFlowError("");
                    retryFn();
                  }}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Retry
                </Button>
              )}
            </Box>
          }
          onClose={() => setFlowError("")}
        >
          <Typography variant="body2" fontWeight={600}>
            {flowError}
          </Typography>
        </Alert>
      )}

      {loading && <LoadingScreen text={loadingText} />}
      {!loading && !started && !interviewSummary && (
        <UploadSection setFile={setFile} uploadResume={uploadResume} />
      )}
      {started && (
        <InterviewSection
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          question={question}
          answer={answer}
          setAnswer={setAnswer}
          submitAnswer={() => submitAnswer()}
          loading={loading}
          feedback={feedback}
          averageScore={averageScore}
          nextQuestion={nextQuestion}
          isDemo={isDemoSession}
        />
      )}
      {!loading && interviewSummary && (
        <SummaryCard interviewSummary={interviewSummary} resetInterview={resetInterview} />
      )}
    </Container>
  );
}
