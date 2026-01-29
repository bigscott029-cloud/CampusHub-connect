import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import Anonymous from "./pages/Anonymous";
import Hostel from "./pages/Hostel";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Academic from "./pages/Academic";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected Routes with Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/anonymous" element={<Anonymous />} />
              <Route path="/hostel" element={<Hostel />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/academic" element={<Academic />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
