import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import {
  Box, Container, Typography, Card, Button, IconButton,
  AppBar, Toolbar, Avatar, Chip, useMediaQuery, Drawer,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider,
} from "@mui/material";
import {
  Psychology, Description, AutoAwesome, TrendingUp,
  RecordVoiceOver, Download, Security, Login as LoginIcon,
  Logout, History, Menu as MenuIcon, Close, ArrowForward,
  School, Star, Speed, CheckCircle, KeyboardArrowRight,
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
    mode: "dark",
    primary: { main: "#6C63FF", light: "#8B85FF", dark: "#4A42E8" },
    secondary: { main: "#00D4FF", light: "#33DDFF", dark: "#00A8CC" },
    success: { main: "#22c55e" },
    warning: { main: "#f59e0b" },
    error: { main: "#FF6B6B" },
    background: { default: "#07070d", paper: "#111128" },
    text: { primary: "#f0f0f5", secondary: "#9090b0" },
    divider: "rgba(255,255,255,0.06)",
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", fontWeight: 600, borderRadius: 12,
          padding: "10px 24px", fontSize: "0.9rem",
          transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 8px 25px rgba(108,99,255,0.35)", transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          borderColor: "rgba(255,255,255,0.1)",
          "&:hover": { borderColor: "#6C63FF", background: "rgba(108,99,255,0.08)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 12px 48px rgba(0,0,0,0.4)",
            borderColor: "rgba(255,255,255,0.10)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        outlined: { borderColor: "rgba(255,255,255,0.1)" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": { background: "rgba(255,255,255,0.05)" },
            "&.Mui-focused": {
              background: "rgba(108,99,255,0.06)",
              "& fieldset": { borderColor: "#6C63FF", borderWidth: 2 },
            },
          },
          "& .MuiInputLabel-root": { fontWeight: 500 },
          "& .MuiInputLabel-root.Mui-focused": { color: "#6C63FF" },
          "& .MuiFormHelperText-root": { fontWeight: 500 },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, background: "rgba(255,255,255,0.06)" },
        bar: { transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" },
      },
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const navItems = [
  { label: "Interview", page: "interview", icon: <Psychology sx={{ fontSize: 18 }} /> },
  { label: "Resume Match", page: "resume", icon: <Description sx={{ fontSize: 18 }} /> },
  { label: "History", page: "history", icon: <History sx={{ fontSize: 18 }} /> },
];

function AppContent() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [started, setStarted] = useState(false);
  const [interviewSummary, setInterviewSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 600px)");

  const resetInterview = () => {
    setStarted(false); setInterviewSummary(null); setLoading(false);
  };

  const handleNav = (p) => {
    setMobileDrawerOpen(false);
    if (authLoading) return;
    if (p !== "home" && !isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setPage(p); resetInterview();
  };

  return (
    <Box className="bg-grid" sx={{ minHeight: "100vh", position: "relative" }}>
      {/* Ambient glow effects */}
      <Box className="glow-dot glow-dot-primary" sx={{ top: "-10%", left: "-5%" }} />
      <Box className="glow-dot glow-dot-secondary" sx={{ bottom: "-10%", right: "-5%" }} />

      {/* ── Navigation ── */}
      <AppBar position="fixed" elevation={0} sx={{
        background: "rgba(7,7,13,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Toolbar sx={{ maxWidth: 1200, width: "100%", mx: "auto", px: { xs: 2, md: 2 } }}>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => { setPage("home"); resetInterview(); }}>
            <Avatar sx={{
              bgcolor: "transparent",
              border: "2px solid #6C63FF",
              width: 34, height: 34,
              boxShadow: "0 0 12px rgba(108,99,255,0.3)",
            }}>
              <Psychology sx={{ color: "#6C63FF", fontSize: 18 }} />
            </Avatar>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              fontSize: "1.15rem",
              background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              SkillCortex
            </Typography>
          </motion.div>

          <Box sx={{ flex: 1 }} />

          {/* Desktop nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", mr: 2 }}>
              {navItems.map((item) => (
                <Button key={item.label} size="small" startIcon={item.icon}
                  onClick={() => handleNav(item.page)}
                  sx={{
                    color: page === item.page ? "#6C63FF" : "text.secondary",
                    position: "relative",
                    "&::after": page === item.page ? {
                      content: '""',
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      height: 2,
                      borderRadius: 1,
                      background: "#6C63FF",
                    } : {},
                    "&:hover": { color: "#6C63FF", background: "rgba(108,99,255,0.08)" },
                  }}>
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Auth section */}
          {isAuthenticated ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: "#6C63FF", width: 26, height: 26, fontSize: 11, fontWeight: 700 }}>
                    {user?.username?.[0]?.toUpperCase()}
                  </Avatar>
                }
                label={user?.username || "User"}
                variant="outlined"
                size="small"
                sx={{
                  color: "text.secondary",
                  borderColor: "rgba(255,255,255,0.08)",
                  display: { xs: "none", md: "flex" },
                  "&:hover": { borderColor: "#6C63FF" },
                }}
              />
              <IconButton size="small" onClick={logout}
                sx={{ color: "text.secondary", "&:hover": { color: "#FF6B6B", background: "rgba(255,107,107,0.1)" } }}>
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
              {isMobile && (
                <IconButton size="small" onClick={() => setMobileDrawerOpen(true)}
                  sx={{ color: "text.secondary" }}>
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button size="small" startIcon={<LoginIcon sx={{ fontSize: 16 }} />}
                onClick={() => setAuthOpen(true)}
                variant="outlined"
                sx={{ borderColor: "rgba(255,255,255,0.1)", color: "text.secondary" }}>
                Login
              </Button>
              {!isMobile && (
                <Button size="small" variant="contained"
                  onClick={() => setAuthOpen(true)}
                  sx={{ background: "linear-gradient(135deg, #6C63FF, #00D4FF)" }}>
                  Sign Up Free
                </Button>
              )}
              {isMobile && (
                <IconButton size="small" onClick={() => setMobileDrawerOpen(true)}
                  sx={{ color: "text.secondary" }}>
                  <MenuIcon sx={{ fontSize: 20 }} />
                </IconButton>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: "rgba(17,17,40,0.98)",
            backdropFilter: "blur(24px)",
            borderLeft: "1px solid rgba(255,255,255,0.06)",
          },
        }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: "text.secondary" }}>
            <Close />
          </IconButton>
        </Box>
        <List sx={{ px: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton onClick={() => handleNav(item.page)}
                sx={{
                  borderRadius: 2, mb: 0.5,
                  background: page === item.page ? "rgba(108,99,255,0.1)" : "transparent",
                  color: page === item.page ? "#6C63FF" : "text.secondary",
                }}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        {isAuthenticated && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
            <Box sx={{ p: 2 }}>
              <Button fullWidth variant="outlined" color="error"
                startIcon={<Logout />} onClick={logout}
                sx={{ borderRadius: 2, borderColor: "rgba(255,107,107,0.3)" }}>
                Logout
              </Button>
            </Box>
          </>
        )}
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />

      {/* ── Pages ── */}
      <AnimatePresence mode="wait">
        {page === "home" && (
          <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <LandingPage onNavigate={handleNav} />
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
            />
          </motion.div>
        )}
        {page === "resume" && (
          <motion.div key="resume" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
              <ResumeMatch />
            </Container>
          </motion.div>
        )}
        {page === "history" && (
          <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
              <HistoryPage />
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Footer */}
      <Box component="footer" sx={{
        mt: page === "home" ? 0 : 8,
        borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(7,7,13,0.5)",
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Psychology sx={{ color: "#6C63FF", fontSize: 20 }} />
              <Typography variant="body2" fontWeight={700} sx={{ background: "linear-gradient(135deg, #6C63FF, #00D4FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                SkillCortex
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Built with React 19 + FastAPI + Gemini AI
            </Typography>
            <Typography variant="body2"            color="text.disabled" sx={{ opacity: 0.5 }}>
              © {new Date().getFullYear()} SkillCortex
            </Typography>
          </Box>
        </Container>
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

/* ═══════════════════════ LANDING PAGE ═══════════════════════ */

const stats = [
  { icon: <AutoAwesome />, value: "AI-Powered", label: "Gemini 2.5 Flash" },
  { icon: <RecordVoiceOver />, value: "Voice Support", label: "Speech-to-Text" },
  { icon: <Download />, value: "PDF Reports", label: "Detailed Analysis" },
  { icon: <Security />, value: "7 Metrics", label: "Comprehensive Scoring" },
];

const features = [
  {
    icon: <Psychology sx={{ fontSize: 40 }} />,
    title: "AI Mock Interview",
    desc: "Practice technical interviews with AI-generated questions based on your resume. Get scored on 7 dimensions with detailed feedback.",
    color: "#6C63FF",
    page: "interview",
    benefits: ["Resume-based questions", "Real-time AI evaluation", "Detailed scoring dashboard"],
  },
  {
    icon: <Description sx={{ fontSize: 40 }} />,
    title: "Resume Match Analyzer",
    desc: "Compare your resume against any job description. Get match percentage, missing skills, and tailored improvement tips.",
    color: "#00D4FF",
    page: "resume",
    benefits: ["ATS-style matching", "Skill gap analysis", "Actionable suggestions"],
  },
];

const benefitsList = [
  { icon: <School />, title: "Practice Smart", desc: "AI generates questions tailored to your resume and experience level" },
  { icon: <TrendingUp />, title: "Track Progress", desc: "Monitor your improvement across 7 scoring dimensions over time" },
  { icon: <Speed />, title: "Save Time", desc: "Get instant feedback instead of waiting for human interviewers" },
  { icon: <Star />, title: "Stay Confident", desc: "Build interview confidence through repetition and detailed insights" },
];

function LandingPage({ onNavigate }) {
  const handleCTA = () => onNavigate("interview");

  return (
    <>
      {/* ── Hero Section ── */}
      <Box sx={{
        position: "relative",
        pt: { xs: 6, md: 10 },
        pb: { xs: 6, md: 10 },
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: "300px", md: "600px" },
          height: { xs: "300px", md: "600px" },
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <Box sx={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 800, mx: "auto" }}>
            {/* Pill badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Chip
                icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                label="Powered by Gemini AI"
                size="small"
                sx={{
                  mb: 3,
                  background: "rgba(108,99,255,0.12)",
                  color: "#8B85FF",
                  fontWeight: 600,
                  border: "1px solid rgba(108,99,255,0.2)",
                  backdropFilter: "blur(8px)",
                  "& .MuiChip-icon": { color: "#8B85FF" },
                }}
              />
            </motion.div>

            {/* Headline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <Typography variant="h1" sx={{
                fontSize: { xs: "2.2rem", sm: "3rem", md: "4rem" },
                fontWeight: 900,
                lineHeight: 1.1,
                mb: 2,
                letterSpacing: "-0.03em",
              }}>
                Master Every{" "}
                <Box component="span" className="gradient-text">Interview</Box>
                {" "}with AI
              </Typography>
            </motion.div>

            {/* Subtitle */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Typography variant="h6" color="text.secondary" sx={{
                maxWidth: 600, mx: "auto", mb: 4,
                fontWeight: 400, fontSize: { xs: "1rem", md: "1.15rem" },
                lineHeight: 1.7,
              }}>
                AI-powered interview preparation and resume analysis. Upload your resume, practice with
                real-time AI feedback, and land your dream job.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Button variant="contained" size="large" onClick={handleCTA}
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                  px: { xs: 3, md: 5 }, py: 1.5,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  borderRadius: 14,
                  boxShadow: "0 4px 20px rgba(108,99,255,0.3)",
                }}>
                Get Started Free
                <KeyboardArrowRight sx={{ ml: 0.5 }} />
              </Button>
              <Button variant="outlined" size="large"
                onClick={() => onNavigate("resume")}
                sx={{
                  px: { xs: 3, md: 4 }, py: 1.5,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  borderRadius: 14,
                }}>
                Try Resume Match
              </Button>
            </motion.div>
          </Box>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Box sx={{
              display: "flex", justifyContent: "center", gap: { xs: 1, md: 3 },
              flexWrap: "wrap", mt: { xs: 6, md: 8 },
            }}>
              {stats.map((stat, i) => (
                <Card key={i} sx={{
                  p: { xs: 1.5, md: 2.5 },
                  display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 },
                  minWidth: { xs: 140, md: 170 },
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}>
                  <Box sx={{ color: "primary.main", opacity: 0.7 }}>{stat.icon}</Box>
                  <Box>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: { xs: "0.8rem", md: "0.9rem" } }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: "0.7rem", md: "0.75rem" } }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Features Section ── */}
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 }, mb: { xs: 6, md: 10 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}>
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5 }}>
              Everything You Need
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
              Two powerful tools to accelerate your interview preparation
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Card onClick={() => onNavigate(f.page)}
                  sx={{
                    p: { xs: 3, md: 4 },
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    "&:hover": {
                      borderColor: f.color,
                      transform: "translateY(-4px)",
                      boxShadow: `0 16px 48px ${f.color}15`,
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${f.color}, transparent)`,
                      opacity: 0.6,
                    },
                  }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: `${f.color}15`,
                      color: f.color,
                      display: "flex",
                    }}>
                      {f.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {f.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {f.desc}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                    {f.benefits.map((b, j) => (
                      <Box key={j} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 14, color: f.color, opacity: 0.7 }} />
                        <Typography variant="caption" color="text.secondary">{b}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 0.5, color: f.color }}>
                    <Typography variant="body2" fontWeight={600}>Get started</Typography>
                    <ArrowForward sx={{ fontSize: 16 }} />
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        </motion.div>
      </Container>

      {/* ── Benefits Section ── */}
      <Box sx={{
        py: { xs: 6, md: 10 },
        background: "radial-gradient(ellipse at center, rgba(108,99,255,0.04) 0%, transparent 70%)",
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
          <motion.div initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}>
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" }, mb: 1.5 }}>
                Why SkillCortex?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: "auto" }}>
                The smartest way to prepare for your next interview
              </Typography>
            </Box>

            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
              gap: { xs: 2, md: 3 },
            }}>
              {benefitsList.map((b, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}>
                  <Card sx={{
                    p: { xs: 2.5, md: 3 },
                    textAlign: "center",
                    height: "100%",
                    "&:hover": { transform: "translateY(-2px)", borderColor: "rgba(108,99,255,0.2)" },
                  }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(108,99,255,0.1)",
                      color: "#6C63FF",
                      display: "inline-flex",
                      mb: 1.5,
                    }}>
                      {b.icon}
                    </Box>
                    <Typography variant="body1" fontWeight={700} gutterBottom>
                      {b.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {b.desc}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── CTA Section ── */}
      <Container maxWidth="md" sx={{ px: { xs: 2, md: 3 }, py: { xs: 6, md: 8 }, textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}>
          <Card sx={{
            p: { xs: 4, md: 6 },
            background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,255,0.04))",
            border: "1px solid rgba(108,99,255,0.15)",
          }}>
            <Psychology sx={{ fontSize: 56, color: "#6C63FF", mb: 2 }} />
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1.5 }}>
              Ready to Ace Your Interview?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 450, mx: "auto" }}>
              Upload your resume and start practicing with AI-powered feedback in minutes.
            </Typography>
            <Button variant="contained" size="large" onClick={handleCTA}
              sx={{
                background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                px: 5, py: 1.5, fontSize: "1rem",
                borderRadius: 14,
              }}>
              Start Practicing Now
              <KeyboardArrowRight sx={{ ml: 0.5 }} />
            </Button>
          </Card>
        </motion.div>
      </Container>
    </>
  );
}

/* ═══════════════════════ INTERVIEW FLOW ═══════════════════════ */

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
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
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
