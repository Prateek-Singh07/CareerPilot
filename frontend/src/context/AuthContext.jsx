import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

// Lazy initializers restore session from localStorage without triggering setState in an effect
function getInitialToken() {
  return localStorage.getItem("auth_token");
}

function getInitialUser() {
  try {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [token, setToken] = useState(getInitialToken);
  // loading is false because token/user are determined synchronously via lazy initializers above
  const [loading] = useState(false);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
