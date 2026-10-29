import { motion } from "framer-motion";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";
import { Psychology } from "@mui/icons-material";

export default function LoadingScreen({ text }) {
  const theme = useTheme();

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
        <CircularProgress
          size={84}
          thickness={3}
          sx={{
            color: theme.palette.primary.main,
          }}
        />
        <Box sx={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <Psychology sx={{ color: theme.palette.primary.main, fontSize: 36 }} />
          </motion.div>
        </Box>
      </Box>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ textAlign: "center" }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{
            mb: 1,
            color: theme.palette.text.primary,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
          }}
        >
          {text}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 360, mx: "auto" }}>
          CareerPilot AI is processing your request in real time...
        </Typography>
      </motion.div>
    </Box>
  );
}
