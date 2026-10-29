import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Typography, Button, TextField, MenuItem, Slider, Card, Chip,
  CircularProgress, Alert, Divider, useTheme, Tooltip,
} from "@mui/material";
import {
  Person, AutoAwesome, CheckCircle, Add, Close, Schedule,
  School, Work, Flag, Save, ArrowForward,
} from "@mui/icons-material";
import api from "../services/api";

const PRESET_ROLES = [
  "Software Development Engineer (SDE)",
  "Frontend Engineer (React / TypeScript)",
  "Backend Engineer (Python / FastAPI)",
  "Full Stack Developer",
  "Data Analyst & SQL Specialist",
  "Machine Learning Engineer",
  "DevOps & Cloud Engineer",
  "Android / Mobile Developer",
];

const SUGGESTED_SKILLS = [
  "Python", "JavaScript", "React", "FastAPI", "SQL", "Docker",
  "Git", "TypeScript", "Node.js", "AWS", "Data Structures", "PostgreSQL",
  "Algorithms", "Linux", "REST APIs", "Tailwind CSS",
];

const EXPERIENCE_OPTIONS = [
  {
    value: "Beginner",
    title: "Beginner",
    desc: "0–1 years (College student / building core foundations)",
  },
  {
    value: "Intermediate",
    title: "Intermediate",
    desc: "1–3 years (Built full-stack projects / know frameworks)",
  },
  {
    value: "Advanced",
    title: "Advanced",
    desc: "3+ years (Deep system design / production engineering)",
  },
];

export default function CareerProfile({ onNavigate }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [customRole, setCustomRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [skills, setSkills] = useState(["Python", "React", "SQL"]);
  const [skillInput, setSkillInput] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(12);
  const [careerGoals, setCareerGoals] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSaved, setLastSaved] = useState(null);

  // Fetch saved profile on mount
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.get("/profile");
        if (isMounted && res.data?.profile) {
          const p = res.data.profile;
          if (PRESET_ROLES.includes(p.target_role)) {
            setTargetRole(p.target_role);
            setCustomRole("");
          } else {
            setTargetRole("Other");
            setCustomRole(p.target_role || "");
          }
          setExperienceLevel(p.experience_level || "Beginner");
          setSkills(p.current_skills || []);
          setWeeklyHours(p.weekly_hours || 12);
          setCareerGoals(p.career_goals || "");
          setLastSaved(p.updated_at || p.created_at);
        }
      } catch (err) {
        console.error("Failed to load career profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || skillInput).trim();
    if (!trimmed) return;
    if (!skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDownSkill = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const finalRole = targetRole === "Other" ? customRole.trim() : targetRole;
    if (!finalRole) {
      setErrorMsg("Please specify your target career role.");
      return;
    }
    if (skills.length === 0) {
      setErrorMsg("Please add at least one technical skill tag.");
      return;
    }

    try {
      setSaving(true);
      const res = await api.put("/profile", {
        target_role: finalRole,
        current_skills: skills,
        experience_level: experienceLevel,
        weekly_hours: weeklyHours,
        career_goals: careerGoals.trim(),
      });
      setSuccessMsg("Career profile saved successfully!");
      if (res.data?.profile?.updated_at) {
        setLastSaved(res.data.profile.updated_at);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      setErrorMsg(err.response?.data?.detail || "Failed to save profile. Please check inputs and retry.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 14 }}>
        <CircularProgress size={44} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* ── Page Header ── */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Box sx={{
          display: "inline-flex", p: 1.5, borderRadius: 3,
          bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
          color: "primary.main", mb: 1.5,
        }}>
          <Person sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: "1.75rem", md: "2.25rem" }, mb: 1, letterSpacing: "-0.02em" }}>
          Personalized Career Profile
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 540, mx: "auto" }}>
          Configure your career trajectory, verified skills, and study availability to personalize your interview coaching and learning roadmaps.
        </Typography>
      </Box>

      {/* ── Status Alerts ── */}
      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setErrorMsg("")}>
          {errorMsg}
        </Alert>
      )}

      {/* ── Profile Configuration Card ── */}
      <Card sx={{ p: { xs: 3, md: 4.5 }, borderRadius: 4, mb: 4 }}>
        <form onSubmit={handleSave}>
          {/* Section 1: Target Career Role */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Work sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                Target Career Role
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
              Select the primary engineering position you are actively targeting.
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              sx={{ mb: targetRole === "Other" ? 2 : 0 }}
            >
              {PRESET_ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
              <MenuItem value="Other">Other (Custom Role)</MenuItem>
            </TextField>

            {targetRole === "Other" && (
              <TextField
                fullWidth
                size="small"
                label="Enter Custom Target Role"
                placeholder="e.g., Security Engineer, QA Automation Engineer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                sx={{ mt: 1.5 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 3.5 }} />

          {/* Section 2: Experience Level */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <School sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                Current Experience Level
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
              Tailors interview depth and study roadmaps to your actual career stage.
            </Typography>

            <Box sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
              gap: 2,
            }}>
              {EXPERIENCE_OPTIONS.map((opt) => {
                const isSelected = experienceLevel === opt.value;
                return (
                  <Box
                    key={opt.value}
                    onClick={() => setExperienceLevel(opt.value)}
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      cursor: "pointer",
                      border: "2px solid",
                      borderColor: isSelected
                        ? "primary.main"
                        : (isDark ? "#3A352F" : "rgba(51, 44, 40, 0.1)"),
                      bgcolor: isSelected
                        ? (isDark ? "rgba(217, 149, 115, 0.12)" : "rgba(185, 111, 80, 0.08)")
                        : "background.paper",
                      transition: "all 200ms ease",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.8 }}>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ color: isSelected ? "primary.main" : "text.primary" }}>
                        {opt.title}
                      </Typography>
                      {isSelected && <CheckCircle sx={{ fontSize: 18, color: "primary.main" }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.4, display: "block" }}>
                      {opt.desc}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Divider sx={{ my: 3.5 }} />

          {/* Section 3: Current Technical Skills */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AutoAwesome sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                Current Technical Skills ({skills.length})
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
              Add tools, languages, and concepts you currently know. Press Enter or click Add to append tags.
            </Typography>

            {/* Input & Add Button */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a skill (e.g. Docker, GraphQL, Redis)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDownSkill}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleAddSkill()}
                disabled={!skillInput.trim()}
                sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, flexShrink: 0 }}
              >
                Add
              </Button>
            </Box>

            {/* Selected Skills Chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5, minHeight: 36 }}>
              {skills.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onDelete={() => handleRemoveSkill(s)}
                  deleteIcon={<Close sx={{ fontSize: "14px !important" }} />}
                  sx={{
                    fontWeight: 700,
                    bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.1)",
                    color: "primary.main",
                    borderColor: isDark ? "rgba(217, 149, 115, 0.3)" : "rgba(185, 111, 80, 0.25)",
                    border: "1px solid",
                    borderRadius: 2,
                  }}
                />
              ))}
              {skills.length === 0 && (
                <Typography variant="caption" sx={{ color: "text.secondary", fontStyle: "italic", py: 0.5 }}>
                  No skills added yet. Click suggested tags below to add them quickly.
                </Typography>
              )}
            </Box>

            {/* Quick Add Suggestions */}
            <Typography variant="caption" fontWeight={700} sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, mb: 1, display: "block" }}>
              Quick Suggestions:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).slice(0, 10).map((s) => (
                <Chip
                  key={s}
                  label={`+ ${s}`}
                  size="small"
                  onClick={() => handleAddSkill(s)}
                  clickable
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(51, 44, 40, 0.04)",
                    color: "text.secondary",
                    "&:hover": { color: "primary.main", borderColor: "primary.main" },
                    borderRadius: 1.5,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Divider sx={{ my: 3.5 }} />

          {/* Section 4: Weekly Study Hours */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Schedule sx={{ color: "primary.main", fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                  Weekly Study & Practice Commitment
                </Typography>
              </Box>
              <Chip
                label={`${weeklyHours} Hours / Week`}
                size="small"
                sx={{
                  bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.15)",
                  color: "secondary.main",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  borderRadius: 2,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 2.5, display: "block" }}>
              {weeklyHours <= 8
                ? "Gentle pace (~1 hour/day): Ideal alongside a full-time academic course."
                : weeklyHours <= 18
                ? "Standard pace (~2–2.5 hours/day): Recommended for major project & campus placement readiness."
                : "Intensive pace (~3–4 hours/day): Accelerated track for imminent hiring drives."}
            </Typography>

            <Slider
              value={weeklyHours}
              min={2}
              max={40}
              step={1}
              onChange={(_, val) => setWeeklyHours(val)}
              valueLabelDisplay="auto"
              sx={{
                color: "primary.main",
                "& .MuiSlider-thumb": {
                  width: 20,
                  height: 20,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3.5 }} />

          {/* Section 5: Career Goals & Notes */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Flag sx={{ color: "primary.main", fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
                Target Goals & Personal Notes (Optional)
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", mb: 2, display: "block" }}>
              Mention target hiring companies, interview deadlines, or specific domains of interest.
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Preparing for SDE-1 campus placement interviews; focusing on asynchronous API design, microservices, and database performance optimization."
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
              helperText={`${careerGoals.length} / 1000 characters`}
            />
          </Box>

          {/* Actions & Footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, pt: 1 }}>
            <Box>
              {lastSaved && (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Last saved: {formatDate(lastSaved)}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
              {onNavigate && (
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward sx={{ fontSize: "16px !important" }} />}
                  onClick={() => onNavigate("roadmap")}
                  sx={{ borderRadius: 2.5, fontWeight: 700 }}
                >
                  View Learning Roadmap
                </Button>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={saving}
                startIcon={<Save />}
                sx={{
                  px: 4, py: 1.3,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  bgcolor: "primary.main",
                  color: isDark ? "#171614" : "#FFFFFF",
                }}
              >
                {saving ? "Saving Profile..." : "Save Career Profile"}
              </Button>
            </Box>
          </Box>
        </form>
      </Card>
    </motion.div>
  );
}
