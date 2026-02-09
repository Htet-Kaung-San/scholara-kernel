import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Globe,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Expert-Led Courses",
    description:
      "Learn from industry experts and experienced educators with proven track records.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Study at your own pace with 24/7 access to all course materials and resources.",
  },
  {
    icon: Users,
    title: "Community Learning",
    description:
      "Connect with fellow learners, participate in discussions, and collaborate on projects.",
  },
  {
    icon: Award,
    title: "Certified Programs",
    description:
      "Earn recognized certifications that boost your career and validate your skills.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Access courses from anywhere in the world with our mobile-friendly platform.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description:
      "All courses are thoroughly reviewed and updated regularly to ensure quality content.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="py-20 lg:py-32 bg-secondary/5"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose Scholaright?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide everything you need to succeed in your
            learning journey, from small local opportunities to
            global scholarships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}