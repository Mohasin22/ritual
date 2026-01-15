import React, { createContext, useState, useCallback, useEffect } from "react";
import api from "@/api";

interface User {
  user_id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  total_points?: number;
  current_streak?: number;
  longest_streak?: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  refreshAccessToken: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem("refresh_token")
  );
  const [isLoading, setIsLoading] = useState(false);

  // Persist tokens
  useEffect(() => {
    if (accessToken) localStorage.setItem("access_token", accessToken);
    else localStorage.removeItem("access_token");
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    else localStorage.removeItem("refresh_token");
  }, [refreshToken]);

  // Fetch user profile when token exists
  useEffect(() => {
    if (accessToken && !user) fetchProfile();
  }, [accessToken]);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) return;

    try {
      const res = await api.get("/auth/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await refreshAccessToken();
      } else {
        console.error("Error fetching profile", err);
      }
    }
  }, [accessToken]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      setAccessToken(res.data.access_token);
      setRefreshToken(res.data.refresh_token);
      setUser({
        user_id: res.data.user_id,
        username: res.data.username,
        email,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", { email, username, password });
      setAccessToken(res.data.access_token);
      setRefreshToken(res.data.refresh_token);
      setUser({
        user_id: res.data.user_id,
        username: res.data.username,
        email,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      const res = await api.post("/auth/refresh", { refresh_token: refreshToken });
      setAccessToken(res.data.access_token);
      setRefreshToken(res.data.refresh_token);
    } catch (err) {
      console.error("Error refreshing token", err);
      logout();
    }
  }, [refreshToken]);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  }, []);

  const updateProfile = useCallback((updatedUser: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  }, []);

  const value: AuthContextType = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshAccessToken,
    isAuthenticated: !!accessToken && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};