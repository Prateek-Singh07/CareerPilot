import { motion } from 'framer-motion';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Psychology } from '@mui/icons-material';

export default function LoadingScreen({ text }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress size={80} sx={{ color: '#6C63FF' }} />
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Psychology sx={{ color: '#6C63FF', fontSize: 32 }} />
          </Box>
        </Box>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Typography variant='h5' fontWeight={700}
          sx={{ mt: 3, background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {text}
        </Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
          Gemini AI is processing your request...
        </Typography>
      </motion.div>
    </Box>
  );
}
