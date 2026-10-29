import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextareaAutosize, Card, Chip, LinearProgress, Alert, useTheme,
} from "@mui/material";
import {
  Upload, Analytics, CheckCircle, Warning, TipsAndUpdates,
  InsertDriveFile, Score, Close, AutoAwesome,
} from "@mui/icons-material";
import api from "../services/api";

const SAMPLE_JOB_DESCRIPTION = `Job Title: Senior Backend Software Engineer
Requirements:
- 3+ years experience with Python, FastAPI, and asynchronous architecture.
- Strong SQL proficiency with PostgreSQL/SQLite, query optimization, and schema design.
- Practical experience with Docker containerization and modern CI/CD deployment workflows.
- Understanding of distributed systems, RESTful API standards, and authentication (JWT).
- Preferred: Exposure to Kubernetes, Redis caching, and automated testing frameworks.`;

export default function ResumeMatch() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRateLimit, setIsRateLimit] = useState(false);

  const handleUseSample = () => {
    const sampleBlob = new Blob(["%PDF-1.4 Demonstration Resume for CareerPilot AI"], { type: "application/pdf" });
    const dummyFile = new File([sampleBlob], "Sample_Candidate_Resume.pdf", { type: "application/pdf" });
    setFile(dummyFile);
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    setError("");
  };

  const analyze = async (forceDemo = false) => {
    setError("");
    setIsRateLimit(false);
    if (!file) { setError("Please upload a resume first."); return; }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported. Please upload a .pdf document.");
      return;
    }
    if (jobDescription.trim() === "") { setError("Please paste the target job description."); return; }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("job_description", jobDescription);
      const isClientDemo = forceDemo || localStorage.getItem("careerpilot_demo_mode") === "true";
      const res = await api.post("/resume-match", fd, {
        params: isClientDemo ? { demo: true } : {},
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail || "";
      if (status === 429 || /rate|quota|limit|exhaust/i.test(detail)) {
        setIsRateLimit(true);
        setError("AI service is temporarily unavailable because its request limit has been reached. You can retry later or use Demo Mode to explore this feature.");
      } else {
        setIsRateLimit(false);
        setError(detail || "Failed to analyze resume match. Please check your document and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (p) => {
    if (p >= 80) return isDark ? "#81C784" : "#2E7D32";
    if (p >= 60) return isDark ? "#9BAF91" : "#71866B";
    if (p >= 40) return isDark ? "#FFB74D" : "#ED6C02";
    return isDark ? "#EF5350" : "#D32F2F";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          display: "inline-flex", p: 1.5, borderRadius: 3,
          bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.15)",
          color: "secondary.main", mb: 1.5,
        }}>
          <Analytics sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 1, letterSpacing: "-0.02em" }}>
          ATS Resume Matcher
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}>
          Compare your resume against any target job description to pinpoint skill gaps, ATS keywords, and tailored improvements.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity={isRateLimit ? "warning" : "error"}
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {isRateLimit && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => {
                    localStorage.setItem("careerpilot_demo_mode", "true");
                    analyze(true);
                  }}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Switch to Demo Mode
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => analyze()}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                Retry
              </Button>
            </Box>
          }
          onClose={() => setError("")}
        >
          <Typography variant="body2" fontWeight={600}>
            {error}
          </Typography>
        </Alert>
      )}

      {/* Input Card */}
      <Card sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3.5,
        mb: 3.5,
      }}>
        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary" }}>
              Step 1: Upload Your Resume (PDF)
            </Typography>
            <Button
              size="small"
              variant="text"
              startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
              onClick={handleUseSample}
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Use Sample Resume & Job Description
            </Button>
          </Box>

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "none" }}
            id="resume-match-input"
          />
          {!file ? (
            <label htmlFor="resume-match-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                }}
              >
                Choose PDF Resume
              </Button>
            </label>
          ) : (
            <Box sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              px: 2,
              borderRadius: 2.5,
              bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.12)",
              border: `1px solid ${isDark ? "rgba(155, 175, 145, 0.3)" : "rgba(113, 134, 107, 0.25)"}`,
            }}>
              <InsertDriveFile sx={{ color: "secondary.main", fontSize: 20 }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: "text.primary" }}>
                {file.name}
              </Typography>
              <Button size="small" onClick={() => setFile(null)} sx={{ minWidth: 24, p: 0.2, color: "text.secondary" }}>
                <Close sx={{ fontSize: 16 }} />
              </Button>
            </Box>
          )}
        </Box>

        {/* Job Description Textarea */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
            Step 2: Paste Job Description
          </Typography>
          <TextareaAutosize
            minRows={5}
            maxRows={10}
            value={jobDescription}
            placeholder="Paste target job requirements, skills, or job posting description here..."
            onChange={(e) => setJobDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              fontSize: "0.95rem",
              fontFamily: "Inter, sans-serif",
              backgroundColor: isDark ? "#2B2824" : "#FAF7F2",
              color: isDark ? "#F3EEE8" : "#332C28",
              border: `1px solid ${isDark ? "#3A352F" : "rgba(51, 44, 40, 0.1)"}`,
              borderRadius: "12px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.6,
              transition: "border-color 0.2s ease, background-color 0.2s ease",
            }}
            onFocus={(e) => { e.target.style.borderColor = theme.palette.primary.main; }}
            onBlur={(e) => { e.target.style.borderColor = isDark ? "#3A352F" : "rgba(51, 44, 40, 0.1)"; }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {jobDescription.length > 0 ? `${jobDescription.split(/\s+/).filter(Boolean).length} words entered` : "Enter job posting details"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            disabled={loading || !file || !jobDescription.trim()}
            onClick={() => analyze()}
            sx={{
              px: 4, py: 1.3,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: "0.95rem",
            }}
          >
            {loading ? "Analyzing resume match..." : "Analyze Match"}
          </Button>
        </Box>
      </Card>

      {/* Results View */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5, mb: 3 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Score sx={{ color: getMatchColor(result.match_percentage) }} />
                  Analysis Results
                </Typography>
                {result.is_demo && (
                  <Chip
                    label="Demo Mode Active"
                    size="small"
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  />
                )}
              </Box>

              {/* Match Score Display */}
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography variant="h1" fontWeight={900} sx={{
                  color: getMatchColor(result.match_percentage),
                  fontSize: { xs: "3.5rem", md: "4.5rem" },
                  lineHeight: 1,
                  mb: 0.5,
                }}>
                  {result.match_percentage}%
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: 1.5 }}>
                  Overall ATS Compatibility Score
                </Typography>
                <Box sx={{ maxWidth: 360, mx: "auto" }}>
                  <LinearProgress
                    variant="determinate"
                    value={result.match_percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(51, 44, 40, 0.06)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: getMatchColor(result.match_percentage),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Strengths & Missing Skills Grid */}
              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                mb: 4,
              }}>
                {/* Strengths */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? "rgba(155, 175, 145, 0.12)" : "rgba(113, 134, 107, 0.08)",
                  border: `1px solid ${isDark ? "rgba(155, 175, 145, 0.25)" : "rgba(113, 134, 107, 0.2)"}`,
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <CheckCircle sx={{ color: "secondary.main", fontSize: 22 }} />
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                      Matched Strengths & Keywords
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {result.strengths?.map((s, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 800 }}>•</Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.5 }}>{s}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Missing Skills */}
                <Box sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: isDark ? "rgba(239, 83, 80, 0.1)" : "rgba(211, 47, 47, 0.05)",
                  border: `1px solid ${isDark ? "rgba(239, 83, 80, 0.25)" : "rgba(211, 47, 47, 0.15)"}`,
                }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Warning sx={{ color: isDark ? "#EF5350" : "#D32F2F", fontSize: 22 }} />
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                      Missing Target Skills
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {result.missing_skills?.map((s, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="body2" sx={{ color: isDark ? "#EF5350" : "#D32F2F", fontWeight: 800 }}>•</Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.5 }}>{s}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Improvement Suggestions */}
              <Box sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: isDark ? "rgba(217, 149, 115, 0.1)" : "rgba(185, 111, 80, 0.06)",
                border: `1px solid ${isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.15)"}`,
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <TipsAndUpdates sx={{ color: "primary.main", fontSize: 22 }} />
                  <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                    ATS Optimization Recommendations
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {result.suggestions?.map((s, idx) => (
                    <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                      <Box sx={{
                        width: 22, height: 22, borderRadius: "50%",
                        bgcolor: isDark ? "rgba(217, 149, 115, 0.2)" : "rgba(185, 111, 80, 0.15)",
                        color: "primary.main",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 800, flexShrink: 0, mt: 0.2,
                      }}>
                        {idx + 1}
                      </Box>
                      <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>{s}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
