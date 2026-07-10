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
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={{ p: { xs: 2, sm: 4 }, mt: 4, borderRadius: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <TrendingUp sx={{ fontSize: 48, color: "#6C63FF", mb: 1 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>AI Feedback</Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Typography variant="h3" fontWeight={800}
              sx={{ color: (averageScore || 0) >= 7 ? "#22c55e" : "#f59e0b" }}>{averageScore || 0}</Typography>
            <Typography variant="h6" color="text.secondary">/10</Typography>
          </Box>
        </Box>

        {/* Radar Chart */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6C63FF"
                fill="#6C63FF"
                fillOpacity={0.25}
                strokeWidth={2}
                animationDuration={800}
                animationBegin={200}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          {metrics.map((m) => (
            <Box key={m.key}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant='body2' fontWeight={600}>{m.label}</Typography>
                <Typography variant='body2' fontWeight={700} sx={{ color: m.color }}>{feedback[m.key] || 0}/10</Typography>
              </Box>
              <LinearProgress variant='determinate' value={feedback[m.key] * 10 || 0}
                sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiLinearProgress-bar': { bgcolor: m.color, borderRadius: 3 } }} />
            </Box>
          ))}
        </Box>

        <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#22c55e' }} /> Strengths
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(feedback.strengths || []).map((item, i) => (
            <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e' }} />
          ))}
        </Box>

        <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ color: '#FF6B6B' }} /> Weaknesses
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {(feedback.weaknesses || []).map((item, i) => (
            <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }} />
          ))}
        </Box>

        <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TipsAndUpdates sx={{ color: '#00D4FF' }} /> Suggestions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {(feedback.suggestions || []).map((item, i) => (
            <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }} />
          ))}
        </Box>

        <Button variant='contained' fullWidth onClick={nextQuestion}
          sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)' }}>
          Next Question <ArrowForward sx={{ ml: 1 }} />
        </Button>
      </Card>
    </motion.div>
  );
}
