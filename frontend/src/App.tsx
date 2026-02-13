import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Page components
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Courses } from "@/components/Courses";
import { Footer } from "@/components/Footer";
import { About } from "@/components/About";
import { Pricing } from "@/components/Pricing";
import { SignIn } from "@/components/SignIn";
import { SignUp } from "@/components/SignUp";
import { Onboarding } from "@/components/Onboarding";
import { Profile } from "@/components/Profile";
import { AllScholarships } from "@/components/AllScholarships";
import { ScholarshipDetails } from "@/components/ScholarshipDetails";
import { Notifications } from "@/components/Notifications";
import { Admin } from "@/components/Admin";
import { TermsOfService } from "@/components/TermsOfService";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { ForgotPassword } from "@/components/ForgotPassword";
import { ResetPassword } from "@/components/ResetPassword";
import { NotFoundPage } from "@/components/NotFoundPage";
import { BadGatewayPage } from "@/components/BadGatewayPage";

// ─── Pages Without Header/Footer ────────────
const AUTH_ROUTES = ["/signin", "/signup", "/onboarding", "/forgot-password", "/reset-password"];
const NO_FOOTER_ROUTES = [
  "/signin",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/profile",
  "/notifications",
  "/admin",
  "/pricing",
  "/scholarships",
  "/404",
  "/502",
];

function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <Courses />
    </main>
  );
}

function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const isErrorRoute = pathname === "/404" || pathname === "/502";

  const showFooter =
    !NO_FOOTER_ROUTES.includes(pathname) &&
    !pathname.startsWith("/scholarships/") &&
    !isAdminRoute &&
    !isErrorRoute;

  return (
    <div className="min-h-screen bg-background">
      {!isAuthRoute && !isAdminRoute && !isErrorRoute && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/scholarships" element={<AllScholarships />} />
        <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="/502" element={<BadGatewayPage />} />

        {/* Auth routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole={["ADMIN", "SUPER_ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {showFooter && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
