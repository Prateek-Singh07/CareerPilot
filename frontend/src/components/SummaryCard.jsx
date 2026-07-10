import { motion } from 'framer-motion';
import { Box, Typography, Button, Card, Chip, LinearProgress } from '@mui/material';
import { Download, Replay, EmojiEvents, Psychology } from '@mui/icons-material';
import api from '../services/api';

export default function SummaryCard({ interviewSummary, resetInterview }) {
  const downloadReport = async () => {
    try {
      const res = await api.get('/download-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'Interview_Report.pdf');
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { console.error(err); alert('Failed to download report.'); }
  };

  const avg = interviewSummary.average_score;
  const getGrade = (s) =>
    s >= 9 ? { label: 'Outstanding!', color: '#22c55e' }
    : s >= 7 ? { label: 'Great Job!', color: '#00D4FF' }
    : s >= 5 ? { label: 'Good Effort', color: '#f59e0b' }
    : { label: 'Keep Practicing', color: '#FF6B6B' };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, textAlign: 'center' }}>
        <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 1, delay: 0.5 }}>
          <EmojiEvents sx={{ fontSize: 72, color: '#f59e0b', mb: 2 }} />
        </motion.div>
        <Typography variant='h4' fontWeight={800} gutterBottom>Interview Complete!</Typography>

        <Box sx={{ my: 3 }}>
          <Typography variant='h2' fontWeight={900} sx={{ color: getGrade(avg).color }}>{avg}</Typography>
          <Typography variant='h5' color='text.secondary'>/10 Average Score</Typography>
          <LinearProgress variant='determinate' value={avg * 10}
            sx={{ mt: 2, height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)',
              '& .MuiLinearProgress-bar': { bgcolor: getGrade(avg).color, borderRadius: 5 } }} />
        </Box>

        <Chip label={getGrade(avg).label}
          sx={{ px: 2, py: 1, fontSize: '1rem', fontWeight: 700,
            bgcolor: `${getGrade(avg).color}20`, color: getGrade(avg).color, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          <Chip icon={<Psychology />}
            label={`${interviewSummary.questions_answered}/${interviewSummary.total_questions} Questions`}
            variant='outlined' sx={{ color: 'text.secondary' }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant='contained' size='large' startIcon={<Download />} onClick={downloadReport}
            sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', px: 4 }}>
            Download Report
          </Button>
          <Button variant='outlined' size='large' startIcon={<Replay />} onClick={resetInterview}>
            Start New Interview
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
}
