import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, TextField, Button, Typography,
  Box, IconButton, Avatar, Tab, Tabs, Alert, CircularProgress, InputAdornment, useTheme,
} from "@mui/material";
import { Close, Visibility, VisibilityOff, Psychology, Email, Person, Lock } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { login, signup } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      bgcolor: isDark ? "#2B2824" : "#FAF7F2",
      color: theme.palette.text.primary,
      transition: "all 200ms ease",
      "&:hover": { bgcolor: isDark ? "#332F2A" : "#F5EFE6" },
      "&.Mui-focused": {
        bgcolor: isDark ? "#22201D" : "#FFFFFF",
        "& fieldset": { borderColor: theme.palette.primary.main, borderWidth: 2 },
      },
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(56, 47, 42, 0.12)" },
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      "&.Mui-focused": { color: theme.palette.primary.main },
    },
    "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: theme.palette.text.secondary, fontSize: 20 },
  };

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleClose = () => { setError(""); onClose(); };

  const handleLogin = async (e) => {
    e.preventDefault(); setError("");
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError("Please fill in all fields"); return;
    }
    setLoading(true);
    try {
      await login(loginUsername.trim(), loginPassword);
      handleClose();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message === "Network Error" || !err.response) {
        setError("Unable to connect to the backend server. Please verify the backend is running and CORS allows this origin.");
      } else {
        setError("Login failed. Please check credentials.");
      }
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault(); setError("");
    if (!signupEmail.trim() || !signupUsername.trim() || !signupPassword.trim()) {
      setError("Please fill in all fields"); return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      await signup(signupEmail.trim(), signupUsername.trim(), signupPassword);
      handleClose();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message === "Network Error" || !err.response) {
        setError("Unable to connect to the backend server. Please verify the backend is running and CORS allows this origin.");
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally { setLoading(false); }
  };

  const switchTab = (_, v) => { setTab(v); setError(""); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{
        transition: { mountOnEnter: true, unmountOnExit: true },
        paper: {
          sx: {
            borderRadius: 4,
            bgcolor: isDark ? "#22201D" : "#FFFEFC",
            border: `1px solid ${isDark ? "#3A352F" : "rgba(56, 47, 42, 0.1)"}`,
            boxShadow: isDark ? "0 24px 60px rgba(0, 0, 0, 0.55)" : "0 24px 60px rgba(56, 47, 42, 0.15)",
            overflow: "hidden",
          },
        },
      }}>
      {/* Header */}
      <Box sx={{
        pt: 3, pb: 0, px: 3,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{
            bgcolor: isDark ? "rgba(217, 149, 115, 0.16)" : "rgba(185, 111, 80, 0.12)",
            border: `2px solid ${theme.palette.primary.main}`,
            width: 36, height: 36,
          }}>
            <Psychology sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: theme.palette.text.primary, lineHeight: 1.2 }}>
              {tab === 0 ? "Welcome to CareerPilot AI" : "Join CareerPilot AI"}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {tab === 0 ? "Sign in to access your interview workspace" : "Create your career preparation account"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: theme.palette.text.secondary }}>
          <Close />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={switchTab} sx={{
        px: 3, mt: 2,
        minHeight: 36,
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: 1.5,
          bgcolor: theme.palette.primary.main,
        },
        "& .MuiTab-root": {
          textTransform: "none", fontWeight: 700, fontSize: "0.9rem",
          minHeight: 36, py: 0.5, px: 2,
          color: theme.palette.text.secondary,
          "&.Mui-selected": { color: theme.palette.primary.main },
        },
      }}>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
        <AnimatePresence mode="wait">
          {tab === 0 ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}>
              <TextField fullWidth label="Username or Email" variant="outlined"
                value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ fontSize: 20, color: theme.palette.text.secondary, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  },
                }} />

              <TextField fullWidth label="Password"
                type={showPassword ? "text" : "password"} variant="outlined"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                sx={{ mb: 1, ...inputSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 20, color: theme.palette.text.secondary, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: theme.palette.text.secondary }}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }} />

              {error && (
                <Alert severity="error" sx={{ mt: 1.5, mb: 1, borderRadius: 2, py: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{
                  mt: 2, py: 1.4, fontSize: "0.95rem",
                  bgcolor: theme.palette.primary.main,
                  color: isDark ? "#171614" : "#FFFFFF",
                  fontWeight: 700,
                  "&:hover:not(:disabled)": { bgcolor: theme.palette.primary.dark },
                  "&:disabled": {
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(56, 47, 42, 0.08)",
                    color: isDark ? "#6E655E" : "#9C9189"
                  },
                  borderRadius: 2.5,
                }}>
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Log In"}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="signup" onSubmit={handleSignup}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}>
              <TextField fullWidth label="Email Address" type="email" variant="outlined"
                value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ fontSize: 20, color: theme.palette.text.secondary, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  },
                }} />

              <TextField fullWidth label="Username" variant="outlined"
                value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ fontSize: 20, color: theme.palette.text.secondary, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                  },
                }} />

              <TextField fullWidth label="Password"
                type={showPassword ? "text" : "password"} variant="outlined"
                value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                sx={{ mb: 1, ...inputSx }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ fontSize: 20, color: theme.palette.text.secondary, opacity: 0.7 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: theme.palette.text.secondary }}>
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }} />

              {signupPassword.length > 0 && signupPassword.length < 6 && (
                <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, ml: 0.5 }}>
                  Minimum 6 characters required
                </Typography>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 1.5, mb: 1, borderRadius: 2, py: 0.5 }}>
                  {error}
                </Alert>
              )}

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{
                  mt: 2, py: 1.4, fontSize: "0.95rem",
                  bgcolor: theme.palette.primary.main,
                  color: isDark ? "#171614" : "#FFFFFF",
                  fontWeight: 700,
                  "&:hover:not(:disabled)": { bgcolor: theme.palette.primary.dark },
                  "&:disabled": {
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(56, 47, 42, 0.08)",
                    color: isDark ? "#6E655E" : "#9C9189"
                  },
                  borderRadius: 2.5,
                }}>
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Create Account"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
