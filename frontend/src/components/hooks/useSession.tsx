import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "citizen" | "officer" | "admin";

export const useSession = (role: Role) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const endpointMap: Record<Role, string> = {
      citizen: "/api/checkUserSession",
      officer: "/api/checkOfficerSession",
      admin: "/api/checkAdminSession",
    };

    const checkSession = async () => {
      try {
        console.log("Credentials option:", {
          credentials: "include",
        });

        const res = await fetch(
          `https://citizen-grivance-system.onrender.com${endpointMap[role]}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Session invalid");

        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        localStorage.clear();
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [role, navigate]);

  return { isAuthenticated, loading };
};
