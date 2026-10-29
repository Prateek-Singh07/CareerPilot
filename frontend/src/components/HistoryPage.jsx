import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box, Typography, Card, Chip, LinearProgress, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, useTheme,
} from "@mui/material";
import {
  History, EmojiEvents, Psychology, TrendingUp, CalendarToday,
  School,
} from "@mui/icons-material";
import api from "../services/api";

export default function HistoryPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history");
        setSessions(res.data.sessions || []);
      } catch (err) {
        setError("Failed to load interview history from server.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getGrade = (s) =>
    s >= 8 ? { label: "Outstanding", color: isDark ? "#81C784" : "#2E7D32" }
    : s >= 6 ? { label: "Good", color: isDark ? "#9BAF91" : "#71866B" }
    : s >= 4 ? { label: "Needs Practice", color: isDark ? "#FFB74D" : "#ED6C02" }
    : { label: "Incomplete", color: isDark ? "#EF5350" : "#D32F2F" };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? (sessions.reduce((a, s) => a + (s.average_score || 0), 0) / totalSessions).toFixed(1)
    : 0;
  const completedSessions = sessions.filter((s) => s.completed).length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 14 }}>
        <CircularProgress size={44} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          display: "inline-flex", p: 1.5, borderRadius: 3,
          bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
          color: "primary.main", mb: 1.5,
        }}>
          <History sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 1, letterSpacing: "-0.02em" }}>
          Interview Session History
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}>
          Review your performance scores, question completions, and session outcomes across past mock interviews.
        </Typography>
      </Box>

      {error && (
        <Card sx={{ p: 2.5, mb: 3, textAlign: "center", bgcolor: isDark ? "rgba(239, 83, 80, 0.12)" : "rgba(211, 47, 47, 0.05)", border: `1px solid ${isDark ? "#EF5350" : "rgba(211, 47, 47, 0.2)"}` }}>
          <Typography color="error" fontWeight={600}>{error}</Typography>
        </Card>
      )}

      {/* Summary Cards */}
      {sessions.length > 0 && (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2.5,
          mb: 4,
        }}>
          <Card sx={{ p: 2.5, textAlign: "center" }}>
            <School sx={{ fontSize: 26, color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
              Total Sessions
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", mt: 0.5 }}>
              {totalSessions}
            </Typography>
          </Card>

          <Card sx={{ p: 2.5, textAlign: "center" }}>
            <EmojiEvents sx={{ fontSize: 26, color: "secondary.main", mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
              Completed Interviews
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", mt: 0.5 }}>
              {completedSessions}
            </Typography>
          </Card>

          <Card sx={{ p: 2.5, textAlign: "center" }}>
            <TrendingUp sx={{ fontSize: 26, color: "primary.main", mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}>
              Average Performance
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", mt: 0.5 }}>
              {avgScore} <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>/ 10</Typography>
            </Typography>
          </Card>
        </Box>
      )}

      {/* History Table */}
      {sessions.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
          <Psychology sx={{ fontSize: 48, color: "primary.main", opacity: 0.7, mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
            No interview history recorded
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 360, mx: "auto" }}>
            Start a mock interview from the navigation bar above. Your completed sessions and scores will be logged here.
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: isDark ? "#2B2824" : "#F0EBE4" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.82rem", textTransform: "uppercase" }}>
                  <CalendarToday sx={{ fontSize: 13, mr: 0.5, verticalAlign: "text-bottom" }} /> Date & Time
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.82rem", textTransform: "uppercase" }}>
                  Average Score
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.82rem", textTransform: "uppercase" }}>
                  Questions Answered
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.82rem", textTransform: "uppercase" }}>
                  Session Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s) => {
                const grade = getGrade(s.average_score);
                return (
                  <TableRow
                    key={s.id}
                    sx={{
                      "&:hover": { bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "#FAF7F2" },
                      "& td": { borderBottom: `1px solid ${theme.palette.divider}`, py: 2 },
                    }}
                  >
                    <TableCell sx={{ color: "text.primary", fontWeight: 600, fontSize: "0.9rem" }}>
                      {formatDate(s.date)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} sx={{ color: grade.color, minWidth: 32 }}>
                          {s.average_score}
                        </Typography>
                        <Box sx={{ width: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={s.average_score * 10}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.08)",
                              "& .MuiLinearProgress-bar": { bgcolor: grade.color },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<Psychology sx={{ fontSize: 14 }} />}
                        label={`${s.questions_answered} / ${s.total_questions}`}
                        size="small"
                        variant="outlined"
                        sx={{ color: "text.primary", borderColor: theme.palette.divider, fontWeight: 600, borderRadius: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={s.completed ? "Completed" : "In Progress"}
                          size="small"
                          sx={{
                            bgcolor: s.completed
                              ? (isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.15)")
                              : (isDark ? "rgba(255, 183, 77, 0.2)" : "rgba(237, 108, 2, 0.12)"),
                            color: s.completed ? "secondary.main" : (isDark ? "#FFB74D" : "#ED6C02"),
                            fontWeight: 700,
                            borderRadius: 2,
                          }}
                        />
                        {s.is_demo && (
                          <Chip
                            label="Demo"
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontWeight: 700, height: 22, fontSize: "0.7rem", borderRadius: 1.5 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </motion.div>
  );
}
