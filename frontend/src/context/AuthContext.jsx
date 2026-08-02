import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      const userData = response.data.data.user;
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token) {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const signup = async (formData) => {
    const response = await api.post("/auth/signup", formData);
    const { user: newUser, token } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    return response.data;
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token } = response.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return response.data;
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
