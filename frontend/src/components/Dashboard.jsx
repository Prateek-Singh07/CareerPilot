import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Box, Typography, Button, Card, Chip, LinearProgress, CircularProgress, useTheme,
} from "@mui/material";
import {
  Psychology, Description, Map, ArrowForward,
  CheckCircle, EmojiEvents, Schedule, Lightbulb,
  RocketLaunch, Add,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard({ onNavigate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [latestRoadmap, setLatestRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        const [histRes, roadRes] = await Promise.allSettled([
          api.get("/history"),
          api.get("/roadmap/latest"),
        ]);

        if (isMounted) {
          if (histRes.status === "fulfilled") {
            setSessions(histRes.value.data.sessions || []);
          }
          if (roadRes.status === "fulfilled" && roadRes.value.data?.roadmap) {
            setLatestRoadmap(roadRes.value.data.roadmap);
          }
        }
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completed).length;
  const avgScore = totalSessions > 0
    ? (sessions.reduce((acc, s) => acc + (s.average_score || 0), 0) / totalSessions).toFixed(1)
    : 0;

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getScoreColor = (score) => {
    if (score >= 8) return isDark ? "#66BB6A" : "#2E7D32";
    if (score >= 6) return isDark ? "#9BAF91" : "#71866B";
    if (score >= 4) return isDark ? "#FFA726" : "#ED6C02";
    return isDark ? "#EF5350" : "#D32F2F";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 14 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={44} sx={{ color: "primary.main", mb: 2 }} />
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Loading your career dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Welcome Banner ── */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Box sx={{
          p: { xs: 3, md: 4.5 },
          mb: 4,
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #2B2824 0%, #22201D 100%)"
            : "linear-gradient(135deg, #F0EBE4 0%, #F8F6F2 100%)",
          border: `1px solid ${isDark ? "#3A352F" : "rgba(185, 111, 80, 0.2)"}`,
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 2px 10px rgba(51, 44, 40, 0.03)",
          position: "relative",
          overflow: "hidden",
        }}>
          <Box sx={{ maxWidth: 660 }}>
            <Chip
              icon={<RocketLaunch sx={{ fontSize: "16px !important", color: "primary.main" }} />}
              label="Career Readiness Hub"
              size="small"
              sx={{
                mb: 2,
                fontWeight: 700,
                bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
                color: "primary.main",
                borderColor: isDark ? "rgba(217, 149, 115, 0.3)" : "rgba(185, 111, 80, 0.2)",
              }}
            />
            <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.75rem", md: "2.35rem" }, mb: 1, letterSpacing: "-0.02em" }}>
              Welcome back, {user?.username || "Candidate"}!
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", fontSize: "1rem", lineHeight: 1.6 }}>
              Track your interview performance, optimize your resume for applicant tracking systems, and follow your structured career roadmap.
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* ── Metrics Cards Grid ── */}
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 2.5,
        mb: 4,
      }}>
        {/* Metric 1: Completed Interviews */}
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Interviews Completed
            </Typography>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(155, 175, 145, 0.18)" : "rgba(113, 134, 107, 0.14)", color: "secondary.main" }}>
              <CheckCircle sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", mb: 0.5 }}>
            {completedSessions}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {totalSessions} total session{totalSessions === 1 ? "" : "s"} logged
          </Typography>
        </Card>

        {/* Metric 2: Average Score */}
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Average AI Score
            </Typography>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)", color: "primary.main" }}>
              <EmojiEvents sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8, mb: 0.5 }}>
            <Typography variant="h3" fontWeight={800} sx={{ color: getScoreColor(Number(avgScore)) }}>
              {avgScore}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>/ 10</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Number(avgScore) * 10}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.06)",
              "& .MuiLinearProgress-bar": { bgcolor: getScoreColor(Number(avgScore)) },
            }}
          />
        </Card>

        {/* Metric 3: Target Role */}
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Target Role
            </Typography>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)", color: "primary.main" }}>
              <Map sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {latestRoadmap?.target_role || "Not set yet"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {latestRoadmap ? `${latestRoadmap.stages?.length || 0} stages structured` : "Generate your roadmap below"}
          </Typography>
        </Card>

        {/* Metric 4: Dedicated Study Time */}
        <Card sx={{ p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Study Pace
            </Typography>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(155, 175, 145, 0.18)" : "rgba(113, 134, 107, 0.14)", color: "secondary.main" }}>
              <Schedule sx={{ fontSize: 20 }} />
            </Box>
          </Box>
          <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", mb: 0.5 }}>
            {latestRoadmap?.hours_per_week ? `${latestRoadmap.hours_per_week}h` : "10h"}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {latestRoadmap?.timeline || "Standard weekly pace"}
          </Typography>
        </Card>
      </Box>

      {/* ── Quick Action Cards ── */}
      <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 2 }}>
        Core Workflows
      </Typography>
      <Box sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
        gap: 2.5,
        mb: 4.5,
      }}>
        {/* Action 1: Mock Interview */}
        <Card sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-3px)",
            boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.6)" : "0 8px 24px rgba(185, 111, 80, 0.12)",
          },
        }}>
          <Box>
            <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)", color: "primary.main", mb: 2 }}>
              <Psychology sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
              Mock Interview
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}>
              Upload your resume and practice technical interview questions with live 7-dimension scoring.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => onNavigate("interview")}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            Start Practice Session
          </Button>
        </Card>

        {/* Action 2: Resume Match */}
        <Card sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:hover": {
            borderColor: "secondary.main",
            transform: "translateY(-3px)",
            boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.6)" : "0 8px 24px rgba(113, 134, 107, 0.14)",
          },
        }}>
          <Box>
            <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(155, 175, 145, 0.18)" : "rgba(113, 134, 107, 0.14)", color: "secondary.main", mb: 2 }}>
              <Description sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
              Resume Matcher
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}>
              Compare your PDF resume against job descriptions to discover missing keywords, ATS match percentages, and actionable tips.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => onNavigate("resume")}
            sx={{
              bgcolor: "secondary.main",
              color: isDark ? "#171614" : "#FFFFFF",
              py: 1.2,
              fontWeight: 700,
              "&:hover": { bgcolor: "secondary.dark" },
            }}
          >
            Analyze Job Fit
          </Button>
        </Card>

        {/* Action 3: Career Roadmap */}
        <Card sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-3px)",
            boxShadow: isDark ? "0 8px 30px rgba(0,0,0,0.6)" : "0 8px 24px rgba(185, 111, 80, 0.12)",
          },
        }}>
          <Box>
            <Box sx={{ display: "inline-flex", p: 1.5, borderRadius: 2.5, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)", color: "primary.main", mb: 2 }}>
              <Map sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
              Career Roadmap
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}>
              Build a personalized, stage-by-stage learning plan with projects, milestones, and timelines tailored to your available time.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => onNavigate("roadmap")}
            sx={{ py: 1.2, fontWeight: 700 }}
          >
            {latestRoadmap ? "View Active Plan" : "Generate Plan"}
          </Button>
        </Card>
      </Box>

      {/* ── Latest Roadmap Callout (if present) ── */}
      {latestRoadmap && (
        <Card sx={{
          p: 3,
          mb: 4,
          background: isDark
            ? "linear-gradient(135deg, rgba(217, 149, 115, 0.08) 0%, rgba(155, 175, 145, 0.06) 100%)"
            : "linear-gradient(135deg, rgba(185, 111, 80, 0.04) 0%, rgba(113, 134, 107, 0.04) 100%)",
          border: `1px solid ${isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.2)"}`,
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(217, 149, 115, 0.18)" : "rgba(185, 111, 80, 0.1)", color: "primary.main" }}>
                <Lightbulb sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                    Recommended Immediate Step: {latestRoadmap.target_role}
                  </Typography>
                  {latestRoadmap.is_demo && (
                    <Chip
                      label="Demo Roadmap"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1.5 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Timeline: {latestRoadmap.timeline}
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              onClick={() => onNavigate("roadmap")}
              endIcon={<ArrowForward sx={{ fontSize: "14px !important" }} />}
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Full Roadmap
            </Button>
          </Box>
          <Typography variant="body2" sx={{
            color: "text.primary",
            lineHeight: 1.6,
            bgcolor: isDark ? "#22201D" : "#FFFEFC",
            p: 2,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
          }}>
            {latestRoadmap.recommended_next_action || "Continue following your structured stage milestones."}
          </Typography>
        </Card>
      )}

      {/* ── Recent Interview Activity ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary" }}>
          Recent Activity
        </Typography>
        {sessions.length > 0 && (
          <Button
            size="small"
            onClick={() => onNavigate("history")}
            endIcon={<ArrowForward sx={{ fontSize: "14px !important" }} />}
            sx={{ color: "text.secondary", fontWeight: 600, "&:hover": { color: "primary.main" } }}
          >
            View All History
          </Button>
        )}
      </Box>

      {sessions.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Box sx={{ display: "inline-flex", p: 2, borderRadius: 3, bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.08)", color: "primary.main", mb: 2 }}>
            <Psychology sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
            No interview sessions yet
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", mb: 3, lineHeight: 1.6 }}>
            Upload your resume and complete your first mock interview. Your scores, radar charts, and PDF reports will be cataloged here.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => onNavigate("interview")}
            sx={{ px: 3, py: 1.2, fontWeight: 700 }}
          >
            Start First Practice Session
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {sessions.slice(0, 4).map((s) => (
            <Card key={s.id} sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              "&:hover": { borderColor: isDark ? "rgba(217, 149, 115, 0.4)" : "rgba(185, 111, 80, 0.3)" },
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: s.completed
                    ? (isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.14)")
                    : (isDark ? "rgba(217, 149, 115, 0.18)" : "rgba(185, 111, 80, 0.12)"),
                  color: s.completed ? "secondary.main" : "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                }}>
                  {s.average_score || 0}
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary" }}>
                      Technical Mock Interview #{s.id}
                    </Typography>
                    {s.is_demo && (
                      <Chip
                        label="Demo Data"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, borderRadius: 1.5 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {formatDate(s.date)} • {s.questions_answered} of {s.total_questions} questions answered
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Chip
                  label={s.completed ? "Completed" : "In Progress"}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    bgcolor: s.completed
                      ? (isDark ? "rgba(102, 187, 106, 0.18)" : "rgba(46, 125, 50, 0.12)")
                      : (isDark ? "rgba(255, 167, 38, 0.18)" : "rgba(237, 108, 2, 0.12)"),
                    color: s.completed
                      ? (isDark ? "#81C784" : "#2E7D32")
                      : (isDark ? "#FFB74D" : "#ED6C02"),
                    borderRadius: 2,
                  }}
                />
                <Button
                  size="small"
                  onClick={() => onNavigate("history")}
                  sx={{ color: "primary.main", fontWeight: 700 }}
                >
                  Details
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
