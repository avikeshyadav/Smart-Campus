import React, { createContext, useContext, useState, useCallback } from "react";

const BASE_URI = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken"));
  const [refreshTokenValue, setRefreshTokenValue] = useState(localStorage.getItem("refreshToken"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE_URI}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Login failed");

    setAccessToken(data.accessToken);
    setRefreshTokenValue(data.refreshToken);
    setUser(data.user);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URI}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      // ignore network errors on logout
    }
    setAccessToken(null);
    setRefreshTokenValue(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }, [accessToken]);

  const refreshAccessToken = useCallback(async () => {
    const res = await fetch(`${BASE_URI}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    const data = await res.json();
    if (!data.success) throw new Error("Session expired");

    setAccessToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  }, [refreshTokenValue]);

  /**
   * Wraps fetch with the Bearer token, and transparently retries once
   * with a refreshed access token on a 401.
   */
  const authFetch = useCallback(
    async (url, options = {}) => {
      const doFetch = (token) =>
        fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        });

      let res = await doFetch(accessToken);

      if (res.status === 401 && refreshTokenValue) {
        try {
          const newToken = await refreshAccessToken();
          res = await doFetch(newToken);
        } catch {
          await logout();
        }
      }

      return res;
    },
    [accessToken, refreshTokenValue, refreshAccessToken, logout]
  );

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, authFetch, BASE_URI }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
