import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { BASE_URI } from "../config/api";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef(null);
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const login = useCallback((token, userData) => {
    accessTokenRef.current = token;
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    accessTokenRef.current = null;

    setAccessToken(null);
    setUser(null);

    try {
      await fetch(`${BASE_URI}/api/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  }, []);

  const tryRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URI}/api/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        accessTokenRef.current = null;
        setAccessToken(null);
        setUser(null);
        return null;
      }

      const data = await res.json();

      accessTokenRef.current = data.accessToken;
      setAccessToken(data.accessToken);

      if (data.user) {
        setUser(data.user);
      }

      return data.accessToken;
    } catch (err) {
      console.error("Silent refresh failed:", err);

      accessTokenRef.current = null;
      setAccessToken(null);
      setUser(null);

      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        await tryRefresh();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [tryRefresh]);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const doFetch = (token) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
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
    [
      accessToken,
      user,
      isLoading,
      login,
      logout,
      tryRefresh,
      authFetch,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
