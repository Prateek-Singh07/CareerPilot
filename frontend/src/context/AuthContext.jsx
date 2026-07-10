import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    const savedUser = localStorage.getItem("auth_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
    setLoading(false);
  }, []);

  // Listen for forced logout from api interceptor
  useEffect(() => {
    const handler = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const signup = useCallback(async (email, username, password) => {
    const res = await api.post("/auth/signup", { email, username, password });
    const t = res.data.access_token;
    localStorage.setItem("auth_token", t);
    setToken(t);
    // Fetch user profile
    const me = await api.get("/auth/me");
    localStorage.setItem("auth_user", JSON.stringify(me.data));
    setUser(me.data);
    return me.data;
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    const t = res.data.access_token;
    localStorage.setItem("auth_token", t);
    setToken(t);
    const me = await api.get("/auth/me");
    localStorage.setItem("auth_user", JSON.stringify(me.data));
    setUser(me.data);
    return me.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
