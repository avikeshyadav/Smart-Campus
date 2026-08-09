import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {BASE_URI} from '../config/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // accessToken changes on every refresh/login, but authFetch is defined
  // once via useCallback — this ref lets it always read the latest token
  // without needing to be recreated (and without stale closures).
  const accessTokenRef = useRef(accessToken);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const login = useCallback((token, userData) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    try {
      await fetch(`${BASE_URI}/api/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      // best-effort — cookie is httpOnly and will simply expire server-side
      console.error("Logout request failed:", err);
    }
  }, []);

  // Attempt a silent refresh using the httpOnly refresh-token cookie.
  // Returns the new access token on success, or null on failure.
  const tryRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URI}/api/refresh`, {
        method: "POST",
        credentials: "include", // send the httpOnly refreshToken cookie
      });

      if (!res.ok) {
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const data = await res.json();
      setAccessToken(data.accessToken);
      if (data.user) setUser(data.user);
      return data.accessToken;
    } catch (err) {
      console.error("Silent refresh failed:", err);
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  // Wrapper around fetch that attaches the access token, and on a 401,
  // attempts exactly one silent refresh + retry before giving up and
  // logging out. Use this for any call to a protected endpoint.
  const authFetch = useCallback(
    async (url, options = {}) => {
      const doFetch = (token) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

      let res = await doFetch(accessTokenRef.current);

      if (res.status === 401) {
        const newToken = await tryRefresh();
        if (newToken) {
          res = await doFetch(newToken);
        } else {
          await logout();
        }
      }

      return res;
    },
    [tryRefresh, logout]
  );

  // Memoize so consumers relying on reference equality (e.g. React.memo
  // children, dependency arrays) don't re-render on every AuthProvider render.
  const value = useMemo(
    () => ({
      accessToken,
      user,
      isLoading,
      login,
      logout,
      tryRefresh,
      authFetch,
    }),
    [accessToken, user, isLoading, login, logout,tryRefresh, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
