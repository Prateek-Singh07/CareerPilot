import { motion } from "framer-motion";
import { Box, Typography, Button, Chip, LinearProgress, Card, useTheme } from "@mui/material";
import { TrendingUp, ArrowForward, CheckCircle, Warning, TipsAndUpdates } from "@mui/icons-material";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";

const metrics = [
  { key: "communication", label: "Communication", color: "#6C63FF" },
  { key: "technical_knowledge", label: "Technical Knowledge", color: "#00D4FF" },
  { key: "confidence", label: "Confidence", color: "#22c55e" },
  { key: "grammar", label: "Grammar", color: "#f59e0b" },
  { key: "problem_solving", label: "Problem Solving", color: "#FF6B6B" },
  { key: "answer_completeness", label: "Completeness", color: "#a855f7" },
  { key: "professionalism", label: "Professionalism", color: "#14b8a6" },
];

export default function FeedbackCard({ feedback, averageScore, nextQuestion }) {
  const theme = useTheme();

  const radarData = metrics.map((m) => ({
    metric: m.label,
    score: feedback[m.key] || 0,
    fullMark: 10,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card sx={{
        p: { xs: 2.5, md: 4 },
        mt: 4,
        borderRadius: 3,
        border: "1px solid rgba(108,99,255,0.1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #6C63FF, #00D4FF, #a855f7)",
          opacity: 0.6,
        },
      }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{
            display: "inline-flex", p: 1.5, borderRadius: 2,
            background: "rgba(108,99,255,0.1)", mb: 1.5,
          }}>
            <TrendingUp sx={{ fontSize: 32, color: "#6C63FF" }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            AI Feedback
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
            <Typography variant="h2" fontWeight={900} sx={{
              color: (averageScore || 0) >= 7 ? "#22c55e" : (averageScore || 0) >= 5 ? "#f59e0b" : "#FF6B6B",
              fontSize: { xs: "2.5rem", md: "3rem" },
            }}>
              {averageScore || 0}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 500 }}>/10</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {(averageScore || 0) >= 9 ? "Outstanding!" : (averageScore || 0) >= 7 ? "Great Job!" : (averageScore || 0) >= 5 ? "Good Effort" : "Keep Practicing"}
          </Typography>
        </Box>

        {/* Radar Chart */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: theme.palette.text.secondary,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6C63FF"
                fill="#6C63FF"
                fillOpacity={0.2}
                strokeWidth={2.5}
                animationDuration={800}
                animationBegin={200}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* Metric Scores Grid */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
          mb: 3,
        }}>
          {metrics.map((m) => (
            <Box key={m.key} sx={{
              p: 1.5,
              borderRadius: 2,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {m.label}
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ color: m.color }}>
                  {feedback[m.key] || 0}/10
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={feedback[m.key] * 10 || 0}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.04)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: m.color,
                    borderRadius: 3,
                    transition: "transform 0.6s ease",
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Strengths */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: "#22c55e",
          }}>
            <CheckCircle sx={{ fontSize: 18 }} /> Strengths
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.strengths || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: "rgba(34,197,94,0.08)",
                  color: "#22c55e",
                  fontWeight: 500,
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Weaknesses */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: "#FF6B6B",
          }}>
            <Warning sx={{ fontSize: 18 }} /> Areas to Improve
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.weaknesses || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: "rgba(255,107,107,0.08)",
                  color: "#FF6B6B",
                  fontWeight: 500,
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Suggestions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: "#00D4FF",
          }}>
            <TipsAndUpdates sx={{ fontSize: 18 }} /> Suggestions
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.suggestions || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: "rgba(0,212,255,0.08)",
                  color: "#00D4FF",
                  fontWeight: 500,
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Next Question Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={nextQuestion}
          sx={{
            py: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
            fontSize: "0.95rem",
            "&:hover": { boxShadow: "0 8px 25px rgba(108,99,255,0.35)" },
          }}
        >
          Next Question <ArrowForward sx={{ ml: 1, fontSize: 18 }} />
        </Button>
      </Card>
    </motion.div>
  );
}
