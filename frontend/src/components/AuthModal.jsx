import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, TextField, Button, Typography,
  Box, IconButton, Avatar, Tab, Tabs, Alert, CircularProgress, InputAdornment,
} from "@mui/material";
import { Close, Visibility, VisibilityOff, Psychology, Email, Person, Lock } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    transition: "all 200ms ease",
    "&:hover": { background: "rgba(255,255,255,0.05)" },
    "&.Mui-focused": {
      background: "rgba(108,99,255,0.06)",
      "& fieldset": { borderColor: "#6C63FF", borderWidth: 2 },
    },
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
    "&.Mui-focused": { color: "#6C63FF" },
  },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "text.secondary", fontSize: 20 },
};

export default function AuthModal({ open, onClose }) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err.response?.data?.detail || "Login failed. Please try again.");
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
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  const switchTab = (_, v) => { setTab(v); setError(""); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      TransitionProps={{ mountOnEnter: true, unmountOnExit: true }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "rgba(17,17,40,0.96)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
        },
      }}>
      {/* Header */}
      <Box sx={{
        pt: 3, pb: 0, px: 3,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{
            bgcolor: "transparent",
            border: "2px solid #6C63FF",
            width: 36, height: 36,
          }}>
            <Psychology sx={{ color: "#6C63FF", fontSize: 20 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {tab === 0 ? "Welcome Back" : "Create Account"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {tab === 0 ? "Sign in to continue" : "Start your interview journey"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small"
          sx={{ color: "text.secondary", "&:hover": { background: "rgba(255,255,255,0.05)" } }}>
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
          background: "linear-gradient(90deg, #6C63FF, #00D4FF)",
        },
        "& .MuiTab-root": {
          textTransform: "none", fontWeight: 600, fontSize: "0.9rem",
          minHeight: 36, py: 0.5, px: 2,
          color: "text.secondary",
          "&.Mui-selected": { color: "#f0f0f5" },
        },
      }}>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      <DialogContent sx={{ pt: 1, pb: 3, px: 3 }}>
        <AnimatePresence mode="wait">
          {tab === 0 ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}>
              <TextField fullWidth label="Username" variant="outlined"
                value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ fontSize: 20, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                }} />

              <TextField fullWidth label="Password"
                type={showPassword ? "text" : "password"} variant="outlined"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                sx={{ mb: 1, ...inputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ fontSize: 20, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "text.secondary" }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }} />

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}>
                    <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: 2, py: 0.5 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{
                  mt: 2, py: 1.5, fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                  "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" },
                  borderRadius: 2,
                }}>
                {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Login"}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="signup" onSubmit={handleSignup}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}>
              <TextField fullWidth label="Email" type="email" variant="outlined"
                value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 20, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                }} />

              <TextField fullWidth label="Username" variant="outlined"
                value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)}
                sx={{ mb: 2, ...inputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ fontSize: 20, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                }} />

              <TextField fullWidth label="Password"
                type={showPassword ? "text" : "password"} variant="outlined"
                value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)}
                sx={{ mb: 1, ...inputSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ fontSize: 20, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: "text.secondary" }}>
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }} />

              {/* Password hint */}
              {signupPassword.length > 0 && signupPassword.length < 6 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, ml: 0.5 }}>
                    Minimum 6 characters required
                  </Typography>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}>
                    <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: 2, py: 0.5 }}>
                      {error}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{
                  mt: 2, py: 1.5, fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                  "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" },
                  borderRadius: 2,
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
