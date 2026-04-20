import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminContextType {
  isAdminLoggedIn: boolean;
  adminUsername: string | null;
  loading: boolean;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = "campushub_admin_session";

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionData) {
      try {
        const { username, timestamp } = JSON.parse(sessionData);
        // Session expires after 24 hours
        const dayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < dayInMs) {
          setAdminUsername(username);
          setIsAdminLoggedIn(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (error) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string) => {
    try {
      // Call the verify_admin_credentials function
      const { data, error } = await supabase.rpc("verify_admin_credentials", {
        p_email: email,
        p_password: password,
      });

      if (error) {
        console.error("Admin auth error:", error);
        return { success: false, message: error.message || "Authentication failed" };
      }

      if (data?.success) {
        // Store session in localStorage
        localStorage.setItem(
          ADMIN_SESSION_KEY,
          JSON.stringify({
            email,
            timestamp: Date.now(),
          })
        );
        setAdminUsername(email);
        setIsAdminLoggedIn(true);
        return { success: true, message: "Login successful" };
      } else {
        return { success: false, message: data?.message || "Invalid credentials" };
      }
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, message: "An error occurred during login" };
    }
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUsername(null);
    setIsAdminLoggedIn(false);
  };

  return (
    <AdminContext.Provider value={{ isAdminLoggedIn, adminUsername, loading, adminLogin, adminLogout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminProvider");
  }
  return context;
};
