import { useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Courses } from "./components/Courses";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";
import { About } from "./components/About";
import { SignIn } from "./components/SignIn";
import { SignUp } from "./components/SignUp";
import { Profile } from "./components/Profile";
import { Pricing } from "./components/Pricing";
import { Onboarding } from "./components/Onboarding";
import { Notifications } from "./components/Notifications";
import { TermsOfService } from "./components/TermsOfService";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { ScholarshipDetails } from "./components/ScholarshipDetails";
import { AllScholarships } from "./components/AllScholarships";
import { Admin } from "./components/Admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />;
      case 'profile':
        return <Profile />;
      case 'pricing':
        return <Pricing />;
      case 'onboarding':
        return <Onboarding onComplete={() => handleNavigation('home')} />;
      case 'notifications':
        return <Notifications />;
      case 'terms':
        return <TermsOfService onNavigate={handleNavigation} />;
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleNavigation} />;
      case 'signin':
        return <SignIn onNavigate={handleNavigation} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigation} />;
      case 'scholarship-details':
        return <ScholarshipDetails onNavigate={handleNavigation} />;
      case 'all-scholarships':
        return <AllScholarships onNavigate={handleNavigation} />;
      case 'admin':
        return <Admin onNavigate={handleNavigation} />;
      case 'home':
      default:
        return (
          <main>
            <Hero onNavigate={handleNavigation} />
            <Features />
            <Courses onNavigate={handleNavigation} />
            <Testimonials />
            <CTA />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentPage={currentPage} onNavigate={handleNavigation} />
      {renderPage()}
      {currentPage !== 'signin' && currentPage !== 'signup' && currentPage !== 'profile' && currentPage !== 'pricing' && currentPage !== 'onboarding' && currentPage !== 'notifications' && currentPage !== 'terms' && currentPage !== 'privacy' && currentPage !== 'scholarship-details' && currentPage !== 'all-scholarships' && currentPage !== 'admin' && <Footer onNavigate={handleNavigation} />}
    </div>
  );
}