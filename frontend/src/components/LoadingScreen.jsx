import { motion } from "framer-motion";
import { Box, Typography, CircularProgress } from "@mui/material";
import { Psychology } from "@mui/icons-material";

export default function LoadingScreen({ text }) {
  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 12,
      px: 2,
    }}>
      {/* Animated spinner with icon */}
      <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress
            size={88}
            thickness={3}
            sx={{
              color: "transparent",
              "& .MuiCircularProgress-circle": {
                stroke: "url(#gradient)",
              },
            }}
          />
        </motion.div>
        <svg width={0} height={0}>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#00D4FF" />
            </linearGradient>
          </defs>
        </svg>

        {/* Fallback spinner since SVG gradient in MUI progress is tricky */}
        <CircularProgress
          size={88}
          thickness={3}
          sx={{
            color: "#6C63FF",
            position: "absolute",
            top: 0, left: 0,
            opacity: 0.3,
          }}
        />
        <CircularProgress
          size={88}
          thickness={3}
          sx={{
            color: "#00D4FF",
            position: "absolute",
            top: 0, left: 0,
            clipPath: "inset(0 50% 0 0)",
            opacity: 0.5,
          }}
        />
        <Box sx={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Psychology sx={{ color: "#6C63FF", fontSize: 36 }} />
          </motion.div>
        </Box>
      </Box>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: "center" }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{
            mb: 1.5,
            background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: "1.1rem", md: "1.3rem" },
          }}
        >
          {text}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: "auto" }}>
          Gemini AI is processing your request...
        </Typography>

        {/* Animated dots */}
        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center", mt: 2 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#6C63FF",
              }}
            />
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}
