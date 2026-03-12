import { useState, useEffect } from "react";

export interface LocalUser {
  id: string;
  username: string;
  role: "admin" | "manager" | "partner" | "user";
  name: string;
  loginTime: string;
}

export function useLocalAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage ao montar
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const isAuth = localStorage.getItem("isAuthenticated");

    if (currentUser && isAuth === "true") {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("isAuthenticated");
      }
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}
