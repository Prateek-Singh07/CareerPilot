import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, MenuItem, Slider, Card, Chip,
  CircularProgress, Alert, Divider, useTheme,
} from "@mui/material";
import {
  Map, AutoAwesome, CheckCircle, Lightbulb, Code, Flag,
  Schedule, School, Refresh,
} from "@mui/icons-material";
import api from "../services/api";

const PRESET_ROLES = [
  "Full Stack Developer",
  "Frontend Engineer (React / Next.js)",
  "Backend Engineer (Python / FastAPI)",
  "Data Analyst & SQL Specialist",
  "Machine Learning Engineer",
  "DevOps & Cloud Engineer",
];

const SKILL_LEVELS = [
  { value: "Beginner", label: "Beginner (Starting fresh / student)" },
  { value: "Intermediate", label: "Intermediate (Built small projects, know syntax)" },
  { value: "Advanced", label: "Advanced (Looking for production mastery)" },
];

export default function CareerRoadmap() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [existingSkills, setExistingSkills] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(12);

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRateLimit, setIsRateLimit] = useState(false);

  // Load existing latest roadmap on mount if one exists
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await api.get("/roadmap/latest");
        if (isMounted && res.data?.roadmap) {
          setRoadmap(res.data.roadmap);
        }
      } catch (err) {
        console.error("Failed to load existing roadmap:", err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    fetchLatest();
    return () => { isMounted = false; };
  }, []);

  const handleGenerate = async (e, forceDemo = false) => {
    if (e) e.preventDefault();
    const finalRole = targetRole === "Other" ? customRole.trim() : targetRole;
    if (!finalRole) {
      setError("Please specify a target career role.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsRateLimit(false);
      const isClientDemo = forceDemo || localStorage.getItem("careerpilot_demo_mode") === "true";
      const res = await api.post("/roadmap", {
        target_role: finalRole,
        skill_level: skillLevel,
        existing_skills: existingSkills,
        hours_per_week: hoursPerWeek,
      }, {
        params: isClientDemo ? { demo: true } : {},
      });
      setRoadmap(res.data);
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      const status = err.response?.status;
      const detail = err.response?.data?.detail || "";
      if (status === 429 || /rate|quota|limit|exhaust/i.test(detail)) {
        setIsRateLimit(true);
        setError("AI service is temporarily unavailable because its request limit has been reached. You can retry later or use Demo Mode to explore this feature.");
      } else {
        setIsRateLimit(false);
        setError(detail || "Failed to generate roadmap. Please check your inputs and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 14 }}>
        <CircularProgress size={40} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* ── Page Header ── */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          display: "inline-flex",
          p: 1.5,
          borderRadius: 3,
          bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
          color: "primary.main",
          mb: 1.5,
        }}>
          <Map sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 1, letterSpacing: "-0.02em" }}>
          AI Career Roadmap
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 520, mx: "auto" }}>
          Generate a realistic, stage-by-stage engineering roadmap tailored to your target position and weekly schedule.
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
                    handleGenerate(null, true);
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
                onClick={() => handleGenerate(null)}
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

      {/* ── Active Roadmap View ── */}
      {roadmap && !loading && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Header Card */}
          <Card sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderColor: isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.2)",
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 1 }}>
                  <Chip
                    icon={<School sx={{ fontSize: "16px !important", color: "primary.main" }} />}
                    label={roadmap.skill_level || "Beginner"}
                    size="small"
                    sx={{
                      bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
                      color: "primary.main",
                      fontWeight: 700,
                    }}
                  />
                  {roadmap.is_demo && (
                    <Chip
                      label="Demo Mode Active"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  )}
                  <Chip
                    icon={<Schedule sx={{ fontSize: "16px !important", color: "secondary.main" }} />}
                    label={roadmap.timeline || "Self-Paced"}
                    size="small"
                    sx={{
                      bgcolor: isDark ? "rgba(155, 175, 145, 0.18)" : "rgba(113, 134, 107, 0.14)",
                      color: "secondary.main",
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.5rem", md: "2rem" } }}>
                  {roadmap.target_role}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => setRoadmap(null)}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Plan Different Role
              </Button>
            </Box>

            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.7, mb: 3 }}>
              {roadmap.overview}
            </Typography>

            {/* Recommended Next Action */}
            <Box sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: isDark ? "rgba(217, 149, 115, 0.1)" : "rgba(185, 111, 80, 0.06)",
              border: `1px solid ${isDark ? "rgba(217, 149, 115, 0.25)" : "rgba(185, 111, 80, 0.18)"}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 2,
            }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.main", color: isDark ? "#171614" : "#FFFFFF", mt: 0.2 }}>
                <Lightbulb sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: "primary.main", mb: 0.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Immediate Priority: Start This Week
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6, fontWeight: 500 }}>
                  {roadmap.recommended_next_action}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Sequential Stages */}
          <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 2.5 }}>
            Structured Stages ({roadmap.stages?.length || 0})
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {roadmap.stages?.map((stage, idx) => (
              <Card key={idx} sx={{
                p: { xs: 3, md: 3.5 },
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 4,
                  height: "100%",
                  bgcolor: idx === 0 ? "primary.main" : idx === 1 ? "secondary.main" : "text.secondary",
                },
              }}>
                {/* Stage Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" fontWeight={800} sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Stage {stage.stage_number || idx + 1}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary" }}>
                      {stage.title}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<Schedule sx={{ fontSize: "14px !important", color: "text.secondary" }} />}
                    label={stage.duration}
                    size="small"
                    sx={{
                      bgcolor: isDark ? "#2B2824" : "#F0EBE4",
                      color: "text.primary",
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, lineHeight: 1.6 }}>
                  {stage.description}
                </Typography>

                {/* Skills */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1 }}>
                    Key Skills & Technologies to Master
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                    {stage.skills?.map((skill, sIdx) => (
                      <Chip
                        key={sIdx}
                        label={skill}
                        size="small"
                        sx={{
                          bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.12)",
                          color: "text.primary",
                          fontWeight: 600,
                          borderRadius: 1.5,
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

                {/* Projects & Milestones Grid */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" }, gap: 2.5 }}>
                  {/* Practical Portfolio Projects */}
                  <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                      <Code sx={{ fontSize: 16 }} /> Practical Portfolio Projects
                    </Typography>
                    {stage.projects?.map((proj, pIdx) => (
                      <Box key={pIdx} sx={{
                        p: 2,
                        mb: 1,
                        borderRadius: 2.5,
                        bgcolor: isDark ? "#2B2824" : "#F8F6F2",
                        border: `1px solid ${theme.palette.divider}`,
                      }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: "text.primary", mb: 0.3 }}>
                          {proj.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.5, display: "block" }}>
                          {proj.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Measurable Milestones */}
                  <Box>
                    <Typography variant="caption" fontWeight={700} sx={{ color: "secondary.main", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                      <Flag sx={{ fontSize: 16 }} /> Measurable Milestones
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {stage.milestones?.map((milestone, mIdx) => (
                        <Box key={mIdx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                          <CheckCircle sx={{ fontSize: 16, color: "secondary.main", mt: 0.3 }} />
                          <Typography variant="body2" sx={{ color: "text.primary", fontSize: "0.85rem", lineHeight: 1.4 }}>
                            {milestone}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </motion.div>
      )}

      {/* ── Generator Form (when no roadmap or requesting a new one) ── */}
      {(!roadmap || loading) && (
        <Card sx={{
          p: { xs: 3, md: 5 },
          maxWidth: 720,
          mx: "auto",
        }}>
          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress size={54} sx={{ color: "primary.main", mb: 3 }} />
              <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 1 }}>
                Building Your Personalized Career Roadmap...
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, mx: "auto" }}>
                Structuring progressive stages, portfolio projects, and timelines matching your {hoursPerWeek} weekly hours.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleGenerate}>
              <Typography variant="h5" fontWeight={800} sx={{ color: "text.primary", mb: 3 }}>
                Customize Your Learning Plan
              </Typography>

              {/* Target Role Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
                  Target Career Role
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: isDark ? "#2B2824" : "#F8F6F2",
                      color: "text.primary",
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: theme.palette.divider },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}` },
                      },
                    },
                  }}
                >
                  {PRESET_ROLES.map((role) => (
                    <MenuItem key={role} value={role} sx={{ color: "text.primary" }}>{role}</MenuItem>
                  ))}
                  <MenuItem value="Other" sx={{ color: "text.primary" }}>Other (Custom specification)</MenuItem>
                </TextField>
              </Box>

              {targetRole === "Other" && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
                    Specify Custom Role
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="e.g. Embedded Firmware Engineer, Cloud Architect"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: isDark ? "#2B2824" : "#F8F6F2",
                        color: "text.primary",
                        borderRadius: 2.5,
                        "& fieldset": { borderColor: theme.palette.divider },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Current Skill Level */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
                  Current Experience Level
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: isDark ? "#2B2824" : "#F8F6F2",
                      color: "text.primary",
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: theme.palette.divider },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: { bgcolor: "background.paper", border: `1px solid ${theme.palette.divider}` },
                      },
                    },
                  }}
                >
                  {SKILL_LEVELS.map((lvl) => (
                    <MenuItem key={lvl.value} value={lvl.value} sx={{ color: "text.primary" }}>{lvl.label}</MenuItem>
                  ))}
                </TextField>
              </Box>

              {/* Existing Skills & Interests */}
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", mb: 1 }}>
                  Existing Skills & Interests (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="e.g. Python basics, Git, solved 50 LeetCode problems, interested in backend APIs"
                  value={existingSkills}
                  onChange={(e) => setExistingSkills(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: isDark ? "#2B2824" : "#F8F6F2",
                      color: "text.primary",
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: theme.palette.divider },
                    },
                  }}
                />
              </Box>

              {/* Available Study Time Slider */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary" }}>
                    Available Study Time Per Week
                  </Typography>
                  <Chip
                    label={`${hoursPerWeek} Hours / Week`}
                    size="small"
                    sx={{
                      bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
                      color: "primary.main",
                      fontWeight: 700,
                    }}
                  />
                </Box>
                <Slider
                  value={hoursPerWeek}
                  min={4}
                  max={40}
                  step={2}
                  onChange={(_, val) => setHoursPerWeek(val)}
                  sx={{
                    color: "primary.main",
                    "& .MuiSlider-thumb": { width: 18, height: 18 },
                  }}
                />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>4 hrs (Casual)</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>20 hrs (Part-time)</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>40 hrs (Full-time)</Typography>
                </Box>
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<AutoAwesome />}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2.5,
                }}
              >
                Generate Career Roadmap
              </Button>
            </form>
          )}
        </Card>
      )}
    </Box>
  );
}
