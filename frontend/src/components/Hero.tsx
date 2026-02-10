import heroVideo from "@/assets/successful-product-launch-by-female-entrepreneur.webm";
import { Button } from "./ui/button";
import { Play } from "lucide-react";
import { useNavigate } from "react-router";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-[20px] px-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl px-[10px] py-[23px]">
            <h2 className="text-4xl lg:text-4xl font-bold text-foreground mb-6 text-center lg:text-left">
              Achieve your dream scholarships with AI-powered Scholarship Assistant
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Unlock your future with ScholarAid, the AI-powered platform that boosts your chances of success.
              Discover tailored scholarship opportunities, get personalized feedback on your applications,
              and connect with past winners to maximize your potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 flex justify-center">
              <video
                src={heroVideo}
                autoPlay loop muted playsInline
                className="block w-4/5 h-auto bg-transparent"
                style={{ background: 'transparent', mixBlendMode: 'normal' }}
                aria-label="Successful product launch by female entrepreneur"
              />
            </div>
            {/* <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div> */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}