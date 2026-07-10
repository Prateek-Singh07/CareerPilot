import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography, Button, TextareaAutosize, Card, Chip, LinearProgress } from '@mui/material';
import { Upload, Analytics, CheckCircle, Warning, TipsAndUpdates } from '@mui/icons-material';
import api from '../services/api';

export default function ResumeMatch() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file) { alert('Please upload a resume.'); return; }
    if (jobDescription.trim() === '') { alert('Please enter a job description.'); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('job_description', jobDescription);
      const res = await api.post('/resume-match', fd);
      setResult(res.data);
    } catch (err) { console.error(err); alert('Failed to analyze resume.'); }
    finally { setLoading(false); }
  };

  const getMatchColor = (p) => p >= 80 ? '#22c55e' : p >= 60 ? '#f59e0b' : '#FF6B6B';

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Analytics sx={{ fontSize: 56, color: '#00D4FF', mb: 2 }} />
        </motion.div>
        <Typography variant='h4' fontWeight={800} gutterBottom>Resume Match Analyzer</Typography>
        <Typography variant='body1' color='text.secondary'>Compare your resume against any job description</Typography>
      </Box>

      <Card sx={{ p: 4, borderRadius: 4, mb: 3 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <input type='file' accept='.pdf,.docx,.doc'
            onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} id='resume-match-input' />
          <label htmlFor='resume-match-input'>
            <Button variant='outlined' component='span' startIcon={<Upload />}>
              {file ? file.name : 'Upload Resume'}
            </Button>
          </label>
        </Box>

        <TextareaAutosize minRows={8} placeholder='Paste Job Description Here...'
          value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
          style={{ width: '100%', padding: '16px', fontSize: '1rem', fontFamily: 'inherit',
            background: 'rgba(255,255,255,0.03)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
            outline: 'none', resize: 'vertical', lineHeight: 1.6, marginBottom: '16px' }} />

        <Button variant='contained' fullWidth size='large' disabled={loading}
          onClick={analyze}
          sx={{ py: 1.5, background: 'linear-gradient(135deg, #00D4FF, #6C63FF)',
            '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' } }}>
          {loading ? 'Analyzing...' : 'Analyze Resume'}
        </Button>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant='h5' fontWeight={700} gutterBottom>Match Results</Typography>
            <Box sx={{ textAlign: 'center', my: 3 }}>
              <Typography variant='h2' fontWeight={900} sx={{ color: getMatchColor(result.match_percentage) }}>{result.match_percentage}%</Typography>
              <Typography variant='body1' color='text.secondary'>Match Score</Typography>
              <LinearProgress variant='determinate' value={result.match_percentage}
                sx={{ mt: 1, height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)',
                  '& .MuiLinearProgress-bar': { bgcolor: getMatchColor(result.match_percentage), borderRadius: 5 } }} />
            </Box>

            <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ color: '#22c55e' }} /> Strengths
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {result.strengths.map((item, i) => (
                <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e' }} />
              ))}
            </Box>

            <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Warning sx={{ color: '#FF6B6B' }} /> Missing Skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {result.missing_skills.map((item, i) => (
                <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }} />
              ))}
            </Box>

            <Typography variant='h6' fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipsAndUpdates sx={{ color: '#00D4FF' }} /> Suggestions
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {result.suggestions.map((item, i) => (
                <Chip key={i} label={item} size='small' sx={{ bgcolor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }} />
              ))}
            </Box>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
