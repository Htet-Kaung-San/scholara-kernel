import image_e8f905ff8bb4614aca78861d4cec459729ac1fa6 from "figma:asset/e8f905ff8bb4614aca78861d4cec459729ac1fa6.png";
import { Button } from "./ui/button";
import { Play, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroProps {
  onNavigate?: (page: string) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-[20px] px-[32px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl px-[10px] py-[23px]">
            <h2 className="text-4xl lg:text-4xl font-bold text-foreground mb-6 text-center lg:text-left">
              Achieve your dream scholarships with AI-powered
              Scholarship Assitant
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Unlock your future with ScholarAid, the AI-powered
              platform that boosts your chances of success.
              Discover tailored scholarship opportunities, get
              personalized feedback on your applications, and
              connect with past winners to maximize your
              potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="group" onClick={() => onNavigate?.('signup')}>
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="group"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 flex justify-center">
              <ImageWithFallback
                src={
                  image_e8f905ff8bb4614aca78861d4cec459729ac1fa6
                }
                alt="Students learning online"
                className="w-4/5 h-auto rounded-lg pt-[0px] pr-[0px] pb-[20px] pl-[0px]"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}