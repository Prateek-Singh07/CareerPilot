import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextareaAutosize, Card, Chip, LinearProgress,
} from "@mui/material";
import {
  Upload, Analytics, CheckCircle, Warning, TipsAndUpdates,
  InsertDriveFile, Score,
} from "@mui/icons-material";
import api from "../services/api";

export default function ResumeMatch() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!file) { alert("Please upload a resume."); return; }
    if (jobDescription.trim() === "") { alert("Please enter a job description."); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("job_description", jobDescription);
      const res = await api.post("/resume-match", fd);
      setResult(res.data);
    } catch (err) { console.error(err); alert("Failed to analyze resume."); }
    finally { setLoading(false); }
  };

  const getMatchColor = (p) => p >= 80 ? "#22c55e" : p >= 60 ? "#f59e0b" : "#FF6B6B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Box sx={{
            display: "inline-flex", p: 2, borderRadius: 3,
            background: "rgba(0,212,255,0.1)", mb: 2,
          }}>
            <Analytics sx={{ fontSize: 48, color: "#00D4FF" }} />
          </Box>
        </motion.div>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
          Resume Match Analyzer
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: "auto" }}>
          Compare your resume against any job description to find gaps and improve your application
        </Typography>
      </Box>

      {/* Input Card */}
      <Card sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        mb: 3,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "linear-gradient(90deg, #00D4FF, #6C63FF)",
          opacity: 0.4,
        },
      }}>
        {/* File Upload */}
        <Box sx={{ mb: 3, textAlign: "center" }}>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
            id="resume-match-input"
          />
          <label htmlFor="resume-match-input">
            <Button
              variant={file ? "contained" : "outlined"}
              component="span"
              startIcon={file ? <CheckCircle /> : <Upload />}
              sx={{
                borderRadius: 2,
                px: 3,
                background: file ? "rgba(34,197,94,0.15)" : "transparent",
                color: file ? "#22c55e" : "text.secondary",
                borderColor: file ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)",
                "&:hover": {
                  borderColor: file ? "rgba(34,197,94,0.5)" : "#00D4FF",
                  background: file ? "rgba(34,197,94,0.2)" : "rgba(0,212,255,0.08)",
                },
              }}
            >
              {file ? file.name : "Upload Resume (PDF, DOCX)"}
            </Button>
          </label>
          {file && (
            <Box sx={{ mt: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
              <InsertDriveFile sx={{ fontSize: 14, color: "#22c55e" }} />
              <Typography variant="caption" color="text.secondary">
                {file.name} ready
              </Typography>
            </Box>
          )}
        </Box>

        {/* Job Description */}
        <TextareaAutosize
          minRows={6}
          maxRows={14}
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 18px",
            fontSize: "0.95rem",
            fontFamily: "Inter, sans-serif",
            background: "rgba(255,255,255,0.02)",
            color: "#f0f0f5",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.7,
            marginBottom: "16px",
            transition: "border-color 0.2s ease",
          }}
          onFocus={(e) => { e.target.style.borderColor = "#00D4FF"; }}
          onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary">
            {jobDescription.length > 0 ? `${jobDescription.split(/\s+/).filter(Boolean).length} words` : ""}
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={loading || !file}
            onClick={analyze}
            sx={{
              px: 4, py: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, #00D4FF, #6C63FF)",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              "&:disabled": { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" },
              "&:hover:not(:disabled)": { boxShadow: "0 8px 25px rgba(0,212,255,0.35)" },
            }}
          >
            {loading ? "Analyzing..." : "Analyze Match"}
          </Button>
        </Box>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Score sx={{ color: getMatchColor(result.match_percentage) }} />
                Match Results
              </Typography>

              {/* Score Display */}
              <Box sx={{ textAlign: "center", my: 3 }}>
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 150, damping: 12 }}
                >
                  <Typography variant="h1" fontWeight={900} sx={{
                    color: getMatchColor(result.match_percentage),
                    fontSize: { xs: "3.5rem", md: "4.5rem" },
                    lineHeight: 1.1,
                    textShadow: `0 0 30px ${getMatchColor(result.match_percentage)}20`,
                  }}>
                    {result.match_percentage}%
                  </Typography>
                </motion.div>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                  Match Score
                </Typography>
                <Box sx={{ maxWidth: 400, mx: "auto" }}>
                  <LinearProgress
                    variant="determinate"
                    value={result.match_percentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getMatchColor(result.match_percentage),
                        borderRadius: 5,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 2, md: 3 },
              }}>
                {/* Strengths */}
                <Card sx={{ p: 2.5, borderRadius: 2, background: "rgba(34,197,94,0.03)", border: "1px solid rgba(34,197,94,0.1)" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "#22c55e" }}>
                    <CheckCircle sx={{ fontSize: 18 }} /> Strengths
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {result.strengths.map((item, i) => (
                      <Chip key={i} label={item} size="small"
                        sx={{ bgcolor: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 500, borderRadius: 1.5 }} />
                    ))}
                  </Box>
                </Card>

                {/* Missing Skills */}
                <Card sx={{ p: 2.5, borderRadius: 2, background: "rgba(255,107,107,0.03)", border: "1px solid rgba(255,107,107,0.1)" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "#FF6B6B" }}>
                    <Warning sx={{ fontSize: 18 }} /> Missing Skills
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {result.missing_skills.map((item, i) => (
                      <Chip key={i} label={item} size="small"
                        sx={{ bgcolor: "rgba(255,107,107,0.1)", color: "#FF6B6B", fontWeight: 500, borderRadius: 1.5 }} />
                    ))}
                  </Box>
                </Card>
              </Box>

              {/* Suggestions */}
              <Box sx={{ mt: 2.5 }}>
                <Card sx={{ p: 2.5, borderRadius: 2, background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1, color: "#00D4FF" }}>
                    <TipsAndUpdates sx={{ fontSize: 18 }} /> Improvement Tips
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {result.suggestions.map((item, i) => (
                      <Chip key={i} label={item} size="small"
                        sx={{ bgcolor: "rgba(0,212,255,0.1)", color: "#00D4FF", fontWeight: 500, borderRadius: 1.5 }} />
                    ))}
                  </Box>
                </Card>
              </Box>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
