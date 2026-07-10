import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Box, Typography, Card, Chip, LinearProgress, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper,
} from "@mui/material";
import { History, EmojiEvents, Psychology, TrendingUp, CalendarToday } from "@mui/icons-material";
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: "#6C63FF" }} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <History sx={{ fontSize: 56, color: "#6C63FF", mb: 2 }} />
        </motion.div>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Interview History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review your past interview sessions and track your progress
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 2 }}>{error}</Typography>
      )}

      {sessions.length === 0 ? (
        <Card sx={{ p: 6, borderRadius: 4, textAlign: "center" }}>
          <Psychology sx={{ fontSize: 64, color: "rgba(108,99,255,0.3)", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No interview sessions yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete an interview practice session to see it here
          </Typography>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{
          borderRadius: 4, background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <CalendarToday sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} /> Date
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <TrendingUp sx={{ fontSize: 14, mr: 0.5, verticalAlign: "middle" }} /> Score
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Questions</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s, i) => {
                const grade = getGrade(s.average_score);
                return (
                  <TableRow key={s.id}
                    sx={{
                      "&:hover": { background: "rgba(108,99,255,0.05)" },
                      "& td": { borderBottom: "1px solid rgba(255,255,255,0.04)" },
                    }}>
                    <TableCell sx={{ color: "text.primary" }}>{formatDate(s.date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ color: grade.color, minWidth: 40 }}>
                          {s.average_score}
                        </Typography>
                        <LinearProgress variant="determinate" value={s.average_score * 10}
                          sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.05)",
                            "& .MuiLinearProgress-bar": { bgcolor: grade.color, borderRadius: 3 } }} />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip icon={<Psychology sx={{ fontSize: 14 }} />}
                        label={`${s.questions_answered}/${s.total_questions}`}
                        size="small" variant="outlined"
                        sx={{ color: "text.secondary", borderColor: "rgba(255,255,255,0.1)" }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={s.completed ? "Completed" : "In Progress"}
                        size="small"
                        sx={{ bgcolor: s.completed ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                          color: s.completed ? "#22c55e" : "#f59e0b", fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {sessions.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 4, flexWrap: "wrap" }}>
          <Card sx={{ p: 3, textAlign: "center", minWidth: 140 }}>
            <EmojiEvents sx={{ fontSize: 32, color: "#f59e0b", mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>{sessions.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
          </Card>
          <Card sx={{ p: 3, textAlign: "center", minWidth: 140 }}>
            <TrendingUp sx={{ fontSize: 32, color: "#6C63FF", mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>
              {sessions.length > 0
                ? (sessions.reduce((a, s) => a + s.average_score, 0) / sessions.length).toFixed(1)
                : "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary">Avg Score</Typography>
          </Card>
        </Box>
      )}
    </motion.div>
  );
}
