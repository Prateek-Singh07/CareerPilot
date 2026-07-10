import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogTitle, DialogContent, TextField, Button, Typography,
  Box, IconButton, Tab, Tabs, Alert, CircularProgress,
} from "@mui/material";
import { Close, Visibility, VisibilityOff, Psychology } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

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

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await login(loginUsername.trim(), loginPassword);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!signupEmail.trim() || !signupUsername.trim() || !signupPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signup(signupEmail.trim(), signupUsername.trim(), signupPassword);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (_, v) => {
    setTab(v);
    setError("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4, background: "rgba(26,26,46,0.95)",
          backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        },
      }}>
      <DialogTitle sx={{ pb: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Psychology sx={{ color: "#6C63FF", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            {tab === 0 ? "Welcome Back" : "Create Account"}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "text.secondary" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={switchTab} sx={{ px: 3, mt: 1,
        "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
        "& .Mui-selected": { color: "#6C63FF !important" },
        "& .MuiTabs-indicator": { background: "#6C63FF" },
      }}>
        <Tab label="Login" />
        <Tab label="Sign Up" />
      </Tabs>

      <DialogContent sx={{ pt: 2 }}>
        <AnimatePresence mode="wait">
          {tab === 0 ? (
            <motion.form key="login" onSubmit={handleLogin}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <TextField fullWidth label="Username" variant="outlined" value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ sx: { borderRadius: 2, background: "rgba(255,255,255,0.03)" } }} />

              <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} variant="outlined"
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} sx={{ mb: 1 }}
                InputProps={{
                  sx: { borderRadius: 2, background: "rgba(255,255,255,0.03)" },
                  endAdornment: (
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: "text.secondary" }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }} />

              {error && <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: 2 }}>{error}</Alert>}

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ mt: 2, py: 1.5, background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                  "&:disabled": { background: "rgba(255,255,255,0.1)" } }}>
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Login"}
              </Button>
            </motion.form>
          ) : (
            <motion.form key="signup" onSubmit={handleSignup}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <TextField fullWidth label="Email" type="email" variant="outlined" value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ sx: { borderRadius: 2, background: "rgba(255,255,255,0.03)" } }} />

              <TextField fullWidth label="Username" variant="outlined" value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)} sx={{ mb: 2 }}
                InputProps={{ sx: { borderRadius: 2, background: "rgba(255,255,255,0.03)" } }} />

              <TextField fullWidth label="Password" type={showPassword ? "text" : "password"} variant="outlined"
                value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} sx={{ mb: 1 }}
                InputProps={{
                  sx: { borderRadius: 2, background: "rgba(255,255,255,0.03)" },
                  endAdornment: (
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} sx={{ color: "text.secondary" }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }} />

              {error && <Alert severity="error" sx={{ mt: 1, mb: 1, borderRadius: 2 }}>{error}</Alert>}

              <Button type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ mt: 2, py: 1.5, background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
                  "&:disabled": { background: "rgba(255,255,255,0.1)" } }}>
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Account"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
