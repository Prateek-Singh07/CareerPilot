import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box, Typography, Card, Chip, LinearProgress, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper,
} from "@mui/material";
import {
  History, EmojiEvents, Psychology, TrendingUp, CalendarToday,
  School,
} from "@mui/icons-material";
import api from "../services/api";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/history");
        setSessions(res.data.sessions || []);
      } catch (err) {
        setError("Failed to load interview history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getGrade = (s) =>
    s >= 9 ? { label: "Outstanding", color: "#22c55e" }
    : s >= 7 ? { label: "Great", color: "#00D4FF" }
    : s >= 5 ? { label: "Good", color: "#f59e0b" }
    : { label: "Needs Work", color: "#FF6B6B" };

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  // Stats
  const totalSessions = sessions.length;
  const avgScore = totalSessions > 0
    ? (sessions.reduce((a, s) => a + s.average_score, 0) / totalSessions).toFixed(1)
    : 0;
  const completedSessions = sessions.filter((s) => s.completed).length;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={48} sx={{ color: "#6C63FF", mb: 2 }} />
          <Typography variant="body2" color="text.secondary">Loading history...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Box sx={{
            display: "inline-flex", p: 2, borderRadius: 3,
            background: "rgba(108,99,255,0.1)", mb: 2,
          }}>
            <History sx={{ fontSize: 48, color: "#6C63FF" }} />
          </Box>
        </motion.div>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
          Interview History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your past interview sessions and track your progress
        </Typography>
      </Box>

      {error && (
        <Card sx={{ p: 3, mb: 3, borderRadius: 2, textAlign: "center", border: "1px solid rgba(255,107,107,0.2)" }}>
          <Typography color="error" fontWeight={600}>{error}</Typography>
        </Card>
      )}

      {/* Stats Cards */}
      {sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Box sx={{
            display: "flex", gap: { xs: 1.5, md: 3 },
            mb: { xs: 3, md: 4 },
            flexWrap: "wrap",
          }}>
            <Card sx={{
              flex: 1, minWidth: 120, p: { xs: 2, md: 3 }, textAlign: "center",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(108,99,255,0.02))",
              border: "1px solid rgba(108,99,255,0.1)",
            }}>
              <School sx={{ fontSize: 28, color: "#6C63FF", mb: 0.5 }} />
              <Typography variant="h4" fontWeight={800}>{totalSessions}</Typography>
              <Typography variant="caption" color="text.secondary">Total Sessions</Typography>
            </Card>
            <Card sx={{
              flex: 1, minWidth: 120, p: { xs: 2, md: 3 }, textAlign: "center",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,212,255,0.02))",
              border: "1px solid rgba(0,212,255,0.1)",
            }}>
              <TrendingUp sx={{ fontSize: 28, color: "#00D4FF", mb: 0.5 }} />
              <Typography variant="h4" fontWeight={800}>{avgScore}</Typography>
              <Typography variant="caption" color="text.secondary">Avg Score</Typography>
            </Card>
            <Card sx={{
              flex: 1, minWidth: 120, p: { xs: 2, md: 3 }, textAlign: "center",
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))",
              border: "1px solid rgba(34,197,94,0.1)",
            }}>
              <EmojiEvents sx={{ fontSize: 28, color: "#22c55e", mb: 0.5 }} />
              <Typography variant="h4" fontWeight={800}>{completedSessions}</Typography>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
            </Card>
          </Box>
        </motion.div>
      )}

      {/* Empty State */}
      {sessions.length === 0 ? (
        <Card sx={{
          p: { xs: 4, md: 6 },
          borderRadius: 3,
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Box sx={{
              display: "inline-flex", p: 2.5, borderRadius: 3,
              background: "rgba(108,99,255,0.06)", mb: 2,
            }}>
              <Psychology sx={{ fontSize: 56, color: "rgba(108,99,255,0.3)" }} />
            </Box>
          </motion.div>
          <Typography variant="h6" fontWeight={700} color="text.secondary" gutterBottom>
            No interview sessions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350, mx: "auto", lineHeight: 1.7 }}>
            Complete an interview practice session to see your results and track your improvement over time.
          </Typography>
        </Card>
      ) : (
        /* Sessions Table */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              background: "rgba(255,255,255,0.02)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ "& th": { borderBottom: "1px solid rgba(255,255,255,0.06)" } }}>
                  <TableCell sx={{
                    fontWeight: 700, color: "text.secondary", fontSize: "0.8rem",
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    <CalendarToday sx={{ fontSize: 13, mr: 0.5, verticalAlign: "text-bottom" }} /> Date
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: 700, color: "text.secondary", fontSize: "0.8rem",
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    Score
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: 700, color: "text.secondary", fontSize: "0.8rem",
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    Questions
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: 700, color: "text.secondary", fontSize: "0.8rem",
                    textTransform: "uppercase", letterSpacing: 0.5,
                  }}>
                    Status
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
                        "&:hover": { background: "rgba(108,99,255,0.04)" },
                        "& td": { borderBottom: "1px solid rgba(255,255,255,0.04)" },
                        transition: "background 0.15s ease",
                      }}
                    >
                      <TableCell sx={{ color: "text.primary", whiteSpace: "nowrap", fontSize: "0.9rem" }}>
                        {formatDate(s.date)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Typography variant="body1" fontWeight={800} sx={{ color: grade.color, minWidth: 36 }}>
                            {s.average_score}
                          </Typography>
                          <Box sx={{ flex: 1, minWidth: 80, maxWidth: 120 }}>
                            <LinearProgress
                              variant="determinate"
                              value={s.average_score * 10}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "rgba(255,255,255,0.04)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: grade.color,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Psychology sx={{ fontSize: 14 }} />}
                          label={`${s.questions_answered}/${s.total_questions}`}
                          size="small"
                          variant="outlined"
                          sx={{ color: "text.secondary", borderColor: "rgba(255,255,255,0.08)", fontWeight: 500, borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={s.completed ? "Completed" : "In Progress"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            borderRadius: 1.5,
                            bgcolor: s.completed ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                            color: s.completed ? "#22c55e" : "#f59e0b",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      )}
    </motion.div>
  );
}
