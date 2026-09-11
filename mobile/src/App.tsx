import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { MobileShell } from "@/components/mobile/MobileShell";
import { AuthScreen } from "@/screens/AuthScreen";
import { Toaster } from "sonner";
import { Sparkles } from "lucide-react";

const queryClient = new QueryClient();

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-glow animate-pulse mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-bold text-base text-slate-200">CampusHub Mobile</h2>
        <p className="text-xs text-slate-500 mt-1">Booting Snapchat-style experience...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  return <MobileShell />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-center" richColors theme="dark" />
        <MainAppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
