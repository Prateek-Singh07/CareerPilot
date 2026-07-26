import { motion } from "framer-motion";
import { Box, Typography, Button, Card, Chip, LinearProgress } from "@mui/material";
import { Download, Replay, EmojiEvents, Psychology, Stars } from "@mui/icons-material";
import api from "../services/api";

export default function SummaryCard({ interviewSummary, resetInterview }) {
  const downloadReport = async () => {
    try {
      const res = await api.get("/download-report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url; link.setAttribute("download", "Interview_Report.pdf");
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); alert("Failed to download report."); }
  };

  const avg = interviewSummary.average_score;
  const getGrade = (s) =>
    s >= 9 ? { label: "Outstanding!", color: "#22c55e", icon: <Stars /> }
    : s >= 7 ? { label: "Great Job!", color: "#00D4FF", icon: <EmojiEvents /> }
    : s >= 5 ? { label: "Good Effort", color: "#f59e0b", icon: <EmojiEvents /> }
    : { label: "Keep Practicing", color: "#FF6B6B", icon: <EmojiEvents /> };

  const grade = getGrade(avg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${grade.color}, ${grade.color}44)`,
          opacity: 0.5,
        },
      }}>
        {/* Trophy Animation */}
        <motion.div
          initial={{ rotate: -30, scale: 0 }}
          animate={{ rotate: [0, -10, 10, -10, 0], scale: 1 }}
          transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Box sx={{
            display: "inline-flex", p: 2, borderRadius: 3,
            background: `${grade.color}12`, mb: 2,
          }}>
            <EmojiEvents sx={{ fontSize: 64, color: grade.color }} />
          </Box>
        </motion.div>

        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
          Interview Complete!
        </Typography>

        {/* Score Display */}
        <Box sx={{ my: 3 }}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150, damping: 12 }}
          >
            <Typography variant="h1" fontWeight={900} sx={{
              color: grade.color,
              fontSize: { xs: "3.5rem", md: "5rem" },
              lineHeight: 1,
              mb: 0.5,
              textShadow: `0 0 40px ${grade.color}30`,
            }}>
              {avg}
            </Typography>
          </motion.div>
          <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500 }}>
            /10 Average Score
          </Typography>

          <Box sx={{ maxWidth: 300, mx: "auto", mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={avg * 10}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,0.04)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: grade.color,
                  borderRadius: 5,
                  transition: "transform 1s ease",
                },
              }}
            />
          </Box>
        </Box>

        {/* Grade Badge */}
        <Chip
          icon={grade.icon}
          label={grade.label}
          sx={{
            px: 1.5, py: 2.5,
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: 2,
            bgcolor: `${grade.color}15`,
            color: grade.color,
            border: `1px solid ${grade.color}30`,
            mb: 3,
            "& .MuiChip-icon": { color: grade.color, fontSize: 22 },
          }}
        />

        {/* Stats */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <Chip
            icon={<Psychology sx={{ fontSize: 16 }} />}
            label={`${interviewSummary.questions_answered}/${interviewSummary.total_questions} Questions Answered`}
            variant="outlined"
            sx={{ color: "text.secondary", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{
          display: "flex",
          gap: { xs: 1.5, md: 2 },
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Download />}
            onClick={downloadReport}
            sx={{
              px: { xs: 3, md: 4 },
              py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
              fontSize: "0.95rem",
              "&:hover": { boxShadow: "0 8px 25px rgba(108,99,255,0.35)" },
            }}
          >
            Download PDF Report
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Replay />}
            onClick={resetInterview}
            sx={{
              px: { xs: 3, md: 4 },
              py: 1.5,
              borderRadius: 2,
              borderColor: "rgba(255,255,255,0.1)",
              fontSize: "0.95rem",
              "&:hover": { borderColor: "#6C63FF", background: "rgba(108,99,255,0.08)" },
            }}
          >
            Start New Interview
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
}
