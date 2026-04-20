import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdminAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdPopup from "@/components/ads/AdPopup";

// Public pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Universities from "./pages/Universities";
import UniversityDetail from "./pages/UniversityDetail";
import About from "./pages/About";
import Safety from "./pages/Safety";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import TrendingPosts from "./pages/TrendingPosts";
import Anonymous from "./pages/Anonymous";
import Hostel from "./pages/Hostel";
import HostelDetail from "./pages/HostelDetail";
import CreateHostelListing from "./pages/CreateHostelListing";
import CreateRoommateRequest from "./pages/CreateRoommateRequest";
import Marketplace from "./pages/Marketplace";
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import Academic from "./pages/Academic";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import ReputationInfo from "./pages/ReputationInfo";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/features" element={<Features />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/university/:slug" element={<UniversityDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/safety" element={<Safety />} />

            {/* Protected Routes with Dashboard Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                  <AdPopup />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/trending/:hashtag" element={<TrendingPosts />} />
              <Route path="/anonymous" element={<Anonymous />} />
              <Route path="/hostel" element={<Hostel />} />
              <Route path="/hostel/:id" element={<HostelDetail />} />
              <Route path="/hostel/create" element={<CreateHostelListing />} />
              <Route path="/hostel/roommate" element={<CreateRoommateRequest />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/academic" element={<Academic />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/reputation" element={<ReputationInfo />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminPanel />
                </AdminProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
