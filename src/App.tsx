import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdminAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AdPopup from "@/components/ads/AdPopup";
import PWASplashScreen from "@/components/pwa/PWASplashScreen";
import PageLoadingFallback from "@/components/common/PageLoadingFallback";

// Public pages - lazy loaded
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Features = lazy(() => import("./pages/Features"));
const Universities = lazy(() => import("./pages/Universities"));
const UniversityDetail = lazy(() => import("./pages/UniversityDetail"));
const About = lazy(() => import("./pages/About"));
const Safety = lazy(() => import("./pages/Safety"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const MarketplaceRules = lazy(() => import("./pages/MarketplaceRules"));

// Protected pages - lazy loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Feed = lazy(() => import("./pages/Feed"));
const TrendingPosts = lazy(() => import("./pages/TrendingPosts"));
const Anonymous = lazy(() => import("./pages/Anonymous"));
const Hostel = lazy(() => import("./pages/Hostel"));
const HostelDetail = lazy(() => import("./pages/HostelDetail"));
const CreateHostelListing = lazy(() => import("./pages/CreateHostelListing"));
const CreateRoommateRequest = lazy(() => import("./pages/CreateRoommateRequest"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Messages = lazy(() => import("./pages/Messages"));
const Groups = lazy(() => import("./pages/Groups"));
const Academic = lazy(() => import("./pages/Academic"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const ReputationInfo = lazy(() => import("./pages/ReputationInfo"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Explore = lazy(() => import("./pages/Explore"));

const queryClient = new QueryClient();

const SpaRedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");

    if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
      navigate(redirect, { replace: true });
    }
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <AdminProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SpaRedirectHandler />
              <PWASplashScreen />
              <Suspense fallback={<PageLoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/universities" element={<Universities />} />
                  <Route path="/university/:slug" element={<UniversityDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/safety" element={<Safety />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/marketplace-rules" element={<MarketplaceRules />} />

                  <Route path="/explore" element={<Explore />} />

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
                    <Route path="/explore" element={<Explore />} />
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
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
