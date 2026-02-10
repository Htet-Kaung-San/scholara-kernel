import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Page components
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Courses } from "@/components/Courses";
import { Testimonials } from "@/components/Testimonials";
import { CTA } from "@/components/CTA";
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

// ─── Pages Without Header/Footer ────────────
const AUTH_ROUTES = ["/signin", "/signup", "/onboarding", "/forgot-password"];
const NO_FOOTER_ROUTES = [
  "/signin",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/profile",
  "/notifications",
  "/admin",
  "/pricing",
  "/scholarships",
];

function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <Courses />
      <Testimonials />
      <CTA />
    </main>
  );
}

function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const showFooter =
    !NO_FOOTER_ROUTES.includes(pathname) &&
    !pathname.startsWith("/scholarships/");

  return (
    <div className="min-h-screen bg-background">
      {!isAuthRoute && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/scholarships" element={<AllScholarships />} />
        <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Auth routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

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
          path="/admin"
          element={
            <ProtectedRoute requiredRole={["ADMIN", "SUPER_ADMIN"]}>
              <Admin />
            </ProtectedRoute>
          }
        />
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