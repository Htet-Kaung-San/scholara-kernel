import { Button } from "./ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function CTA() {
  const benefits = [
    "Access to 500+ premium courses",
    "Learn from industry experts",
    "Earn recognized certifications",
    "Lifetime access to materials",
    "24/7 community support"
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Future?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Join thousands of successful students who have advanced their careers 
            with EduLearn. Start your learning journey today and unlock your potential.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-primary-foreground/90">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="group text-primary hover:text-primary"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Talk to an Advisor
            </Button>
          </div>
          
          <p className="text-sm text-primary-foreground/70 mt-6">
            30-day money-back guarantee • No setup fees • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}