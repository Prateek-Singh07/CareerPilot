import { motion } from "framer-motion";
import { Box, Typography, Button, Card, Chip, LinearProgress, useTheme } from "@mui/material";
import { Download, Replay, EmojiEvents, Psychology, Stars } from "@mui/icons-material";
import api from "../services/api";

export default function SummaryCard({ interviewSummary, resetInterview }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const downloadReport = async () => {
    try {
      const res = await api.get("/download-report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "CareerPilot_Interview_Report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err.response?.status === 400) return;
      console.error("Download failed:", err);
      alert("Failed to download PDF report. Please try again.");
    }
  };

  const avg = interviewSummary?.average_score || 0;
  const getGrade = (s) =>
    s >= 8.5 ? { label: "Outstanding Performance", color: isDark ? "#81C784" : "#2E7D32", icon: <Stars /> }
    : s >= 7 ? { label: "Solid Technical Ready", color: isDark ? "#9BAF91" : "#71866B", icon: <EmojiEvents /> }
    : s >= 5 ? { label: "Good Foundation", color: isDark ? "#FFB74D" : "#ED6C02", icon: <EmojiEvents /> }
    : { label: "Needs Targeted Practice", color: theme.palette.primary.main, icon: <EmojiEvents /> };

  const grade = getGrade(avg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card sx={{
        p: { xs: 3.5, md: 5 },
        borderRadius: 4,
        textAlign: "center",
        borderColor: isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top Trophy */}
        <Box sx={{
          display: "inline-flex", p: 2, borderRadius: 3,
          bgcolor: isDark ? "rgba(217, 149, 115, 0.18)" : "rgba(185, 111, 80, 0.1)",
          color: "primary.main", mb: 2,
        }}>
          <EmojiEvents sx={{ fontSize: 56 }} />
        </Box>

        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: "text.primary", fontSize: { xs: "1.6rem", md: "2.2rem" } }}>
          Interview Complete!
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", mb: 3 }}>
          Great effort! Your technical responses have been evaluated and cataloged into your session history.
        </Typography>

        {/* Score Display */}
        <Box sx={{ my: 3 }}>
          <Typography variant="h1" fontWeight={900} sx={{
            color: grade.color,
            fontSize: { xs: "3.5rem", md: "4.8rem" },
            lineHeight: 1,
            mb: 0.5,
          }}>
            {avg}
          </Typography>
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 600 }}>
            out of 10 Average Score
          </Typography>

          <Box sx={{ maxWidth: 320, mx: "auto", mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={avg * 10}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.08)",
                "& .MuiLinearProgress-bar": { bgcolor: grade.color, borderRadius: 4 },
              }}
            />
          </Box>
        </Box>

        {/* Grade Badge */}
        <Chip
          icon={grade.icon}
          label={grade.label}
          sx={{
            px: 2, py: 2.2,
            fontSize: "0.95rem",
            fontWeight: 700,
            borderRadius: 2.5,
            bgcolor: isDark ? "#2B2824" : "#F0EBE4",
            color: grade.color,
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
            "& .MuiChip-icon": { color: grade.color, fontSize: 20 },
          }}
        />

        {/* Questions Stats */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4 }}>
          <Chip
            icon={<Psychology sx={{ fontSize: 16, color: "text.secondary" }} />}
            label={`${interviewSummary?.questions_answered || 0} of ${interviewSummary?.total_questions || 0} Questions Completed`}
            variant="outlined"
            sx={{ color: "text.primary", borderColor: theme.palette.divider, fontWeight: 600 }}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Download />}
            onClick={downloadReport}
            sx={{
              px: 4, py: 1.4,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: "0.95rem",
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
              px: 4, py: 1.4,
              borderRadius: 2.5,
              borderColor: theme.palette.divider,
              color: "text.primary",
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            Start New Session
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
}
