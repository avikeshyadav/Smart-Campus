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
import { isSuperAdmin } from "../rbac/rbac";
import { getRbacMe } from "../rbac/rbacApi";

const AuthContext = createContext(undefined);

/* =========================================================
   NORMALIZE USER
========================================================= */
const normalizeUser = (data) => {
  if (!data) return null;

  const user = data?.user || data;

  const roles = Array.isArray(user?.roles)
    ? user.roles
    : [];

  const permissions = Array.isArray(user?.permissions)
    ? user.permissions
    : [];

  return {
    ...user,
    roles,
    permissions,
    isSuperAdmin:
      user?.isSuperAdmin === true ||
      isSuperAdmin(user),
  };
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const accessTokenRef = useRef(null);

  /* =========================================================
     KEEP TOKEN REF UPDATED
  ========================================================= */
  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  /* =========================================================
     LOAD RBAC FROM BACKEND
  ========================================================= */
  const loadRBAC = useCallback(async (token) => {
    if (!token) {
      console.log("RBAC: No access token");
      return null;
    }

    try {
      const data = await getRbacMe(token);
      const rbacUser = normalizeUser(data); 

      setUser((currentUser) => ({
        ...(currentUser || {}),
        ...(rbacUser || {}),
        roles: rbacUser?.roles || [],
        permissions: rbacUser?.permissions || [],
        isSuperAdmin: rbacUser?.isSuperAdmin === true,
      }));

      return rbacUser;
    } catch (error) {
      console.error("RBAC load failed:", error);

      /*
        RBAC failure should not automatically logout the user.
        Authentication and authorization are separate concerns.
      */

      return null;
    }
  }, []);

  /* =========================================================
     LOGIN
  ========================================================= */
  const login = useCallback(
    async (token, userData) => {

      accessTokenRef.current = token;
      setAccessToken(token);
      setUser(normalizeUser(userData));
      await loadRBAC(token);
    },
    [loadRBAC]
  );

  /* =========================================================
     LOGOUT
  ========================================================= */
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

  /* =========================================================
     REFRESH TOKEN
  ========================================================= */
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
      const newToken = data.accessToken;

      accessTokenRef.current = newToken;
      setAccessToken(newToken);

      /*
        Refresh response may contain user,
        but ALWAYS load latest RBAC from DB.
      */
      if (data.user) {
        setUser(normalizeUser(data.user));
      }

      await loadRBAC(newToken);

      return newToken;
    } catch (err) {
      console.error("Silent refresh failed:", err);

      accessTokenRef.current = null;

      setAccessToken(null);
      setUser(null);

      return null;
    }
  }, [loadRBAC]);

  /* =========================================================
     AUTH FETCH
  ========================================================= */
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

      /*
        Access token expired
      */
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

  /* =========================================================
     CONTEXT VALUE
  ========================================================= */
  const value = useMemo(
    () => ({
      accessToken,
      user,
      isLoading,

      login,
      logout,
      tryRefresh,
      authFetch,

      /*
        Optional:
        Other components can manually refresh RBAC
        after role/permission changes.
      */
      loadRBAC,
    }),
    [
      accessToken,
      user,
      isLoading,
      login,
      logout,
      tryRefresh,
      authFetch,
      loadRBAC,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   USE AUTH
========================================================= */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};