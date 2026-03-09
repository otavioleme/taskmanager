"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const name = Cookies.get("name");
    const email = Cookies.get("email");

    if (token && name && email) {
      setUser({ token, name, email });
    }
  }, []);

  const login = (user: User) => {
    Cookies.set("token", user.token, { expires: 1 });
    Cookies.set("name", user.name, { expires: 1 });
    Cookies.set("email", user.email, { expires: 1 });
    setUser(user);
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("name");
    Cookies.remove("email");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);