// -----------------------------------------------------------------------------
// Primary Author: Kate M
// Year: 2025
// Component: authContext
// Purpose: Context for managing authentication state and user roles.
// -----------------------------------------------------------------------------

import { createContext, useContext, useEffect, useState } from "react";
import { useQuery, gql } from "@apollo/client";
import { useCookies } from "react-cookie";

const GET_CURRENT_USER = gql`
  query GetCurrentUser($token: String!) {
    getCurrentUser(token: $token) {
      email
      role
    }
  }
`;

interface AuthContextType {
  cookies: { session?: any };
  isLoggedIn: boolean;
  userRole: { email: string; role: string };
  handleLogin: (token: string) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [cookies, setCookies, removeCookie] = useCookies(["session"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<{
    email: string;
    role: string;
  }>({ email: "", role: "" });

  const { data, error } = useQuery(GET_CURRENT_USER, {
    variables: { token: cookies.session },
    skip: !cookies.session || Boolean(userRole.email),
  });

  useEffect(() => {
    if (cookies.session) {
      setIsLoggedIn(true);
      if (data?.getCurrentUser) {
        setUserRole({
          email: data.getCurrentUser.email,
          role: data.getCurrentUser.role,
        });
      } else if (error) {
        setUserRole({ email: "", role: "" });
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [cookies, data, error]);


  const handleLogin = (token: string) => {
    setCookies("session", token, { path: "/", secure: true, sameSite: "lax", expires: new Date(Date.now() + 1800 * 1000) }); // 30min expiration
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    removeCookie("session");
    setUserRole({ email: "", role: "" });
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        cookies,
        isLoggedIn,
        userRole,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
