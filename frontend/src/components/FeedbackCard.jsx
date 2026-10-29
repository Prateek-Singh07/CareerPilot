import { motion } from "framer-motion";
import { Box, Typography, Button, Chip, LinearProgress, Card, useTheme } from "@mui/material";
import { TrendingUp, ArrowForward, CheckCircle, Warning, TipsAndUpdates } from "@mui/icons-material";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer,
} from "recharts";

export default function FeedbackCard({ feedback, averageScore, nextQuestion }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const metrics = [
    { key: "communication", label: "Communication", color: theme.palette.primary.main },
    { key: "technical_knowledge", label: "Technical Knowledge", color: theme.palette.secondary.main },
    { key: "confidence", label: "Confidence", color: theme.palette.primary.main },
    { key: "grammar", label: "Grammar", color: theme.palette.secondary.main },
    { key: "problem_solving", label: "Problem Solving", color: theme.palette.primary.main },
    { key: "answer_completeness", label: "Completeness", color: theme.palette.secondary.main },
    { key: "professionalism", label: "Professionalism", color: theme.palette.primary.main },
  ];

  const radarData = metrics.map((m) => ({
    metric: m.label,
    score: feedback[m.key] || 0,
    fullMark: 10,
  }));

  const overallScore = feedback.score || 0;
  const scoreColor = overallScore >= 7
    ? (isDark ? "#81C784" : "#2E7D32")
    : overallScore >= 5
    ? (isDark ? "#FFB74D" : "#ED6C02")
    : (isDark ? "#EF5350" : "#D32F2F");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={{
        p: { xs: 3, md: 4 },
        mt: 4,
        borderColor: isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.2)",
      }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Box sx={{
            display: "inline-flex", p: 1.5, borderRadius: 2.5,
            bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
            color: "primary.main", mb: 1,
          }}>
            <TrendingUp sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 1 }}>
            AI Evaluation & Feedback
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1 }}>
            <Typography variant="h2" fontWeight={900} sx={{
              color: scoreColor,
              fontSize: { xs: "2.5rem", md: "3rem" },
            }}>
              {overallScore}
            </Typography>
            <Typography variant="h5" sx={{ color: "text.secondary", fontWeight: 600 }}>/ 10</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            Running Session Average: {averageScore || 0}/10
          </Typography>
        </Box>

        {/* Radar Chart */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke={isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(51, 44, 40, 0.12)"} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: isDark ? "#B4AAA0" : "#776D65", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: isDark ? "#847A70" : "#9E948C", fontSize: 9 }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={theme.palette.primary.main}
                fill={theme.palette.primary.main}
                fillOpacity={isDark ? 0.28 : 0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        {/* 7 Dimensions Grid */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 1.5,
          mb: 3,
        }}>
          {metrics.map((m) => (
            <Box key={m.key} sx={{
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: isDark ? "#2B2824" : "#F8F6F2",
              border: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" fontWeight={700} sx={{ color: "text.primary" }}>
                  {m.label}
                </Typography>
                <Typography variant="caption" fontWeight={800} sx={{ color: m.color }}>
                  {feedback[m.key] || 0} / 10
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(feedback[m.key] || 0) * 10}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.08)",
                  "& .MuiLinearProgress-bar": { bgcolor: m.color },
                }}
              />
            </Box>
          ))}
        </Box>

        {/* Strengths */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: isDark ? "#81C784" : "#2E7D32",
          }}>
            <CheckCircle sx={{ fontSize: 18 }} /> What You Did Well
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.strengths || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: isDark ? "rgba(102, 187, 106, 0.15)" : "rgba(46, 125, 50, 0.1)",
                  color: isDark ? "#A5D6A7" : "#2E7D32",
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Areas to Improve */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: isDark ? "#FFB74D" : "#ED6C02",
          }}>
            <Warning sx={{ fontSize: 18 }} /> Areas for Growth
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.weaknesses || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: isDark ? "rgba(255, 167, 38, 0.15)" : "rgba(237, 108, 2, 0.1)",
                  color: isDark ? "#FFCC80" : "#ED6C02",
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Suggestions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{
            mb: 1, display: "flex", alignItems: "center", gap: 1, color: "primary.main",
          }}>
            <TipsAndUpdates sx={{ fontSize: 18 }} /> Actionable Recommendations
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
            {(feedback.suggestions || []).map((item, i) => (
              <Chip
                key={i}
                label={item}
                size="small"
                sx={{
                  bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
                  color: "primary.main",
                  fontWeight: 600,
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
          size="large"
          onClick={nextQuestion}
          endIcon={<ArrowForward />}
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            fontWeight: 700,
            fontSize: "0.98rem",
          }}
        >
          Continue to Next Question
        </Button>
      </Card>
    </motion.div>
  );
}
