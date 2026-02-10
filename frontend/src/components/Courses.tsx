import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Star, Clock, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";

const courses = [
  {
    title: "Complete Web Development Bootcamp",
    description:
      "Master HTML, CSS, JavaScript, React, and Node.js to become a full-stack developer.",
    image:
      "https://images.unsplash.com/photo-1566314748815-2ff5db8edf2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rcyUyMGVkdWNhdGlvbiUyMGtub3dsZWRnZXxlbnwxfHx8fDE3NTg0MTc1OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Closed",
    duration: "12 weeks",
    students: "2,340",
    rating: 4.8,
    price: "$99",
  },
  {
    title: "Data Science & Machine Learning",
    description:
      "Learn Python, statistics, machine learning algorithms, and data visualization.",
    image:
      "https://images.unsplash.com/photo-1758270703081-3e1595e2b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwc3VjY2VzcyUyMGFjaGlldmVtZW50fGVufDF8fHx8MTc1ODQxNzU5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Ongoing",
    duration: "16 weeks",
    students: "1,856",
    rating: 4.9,
    price: "$149",
  },
  {
    title: "Digital Marketing Mastery",
    description:
      "Comprehensive course covering SEO, social media, content marketing, and analytics.",
    image:
      "https://images.unsplash.com/photo-1758270704587-43339a801396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwaW5zdHJ1Y3Rpb258ZW58MXx8fHwxNzU4NDE3NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    level: "Upcoming",
    duration: "8 weeks",
    students: "3,204",
    rating: 4.7,
    price: "$79",
  },
];

const getBadgeVariant = (level: string) => {
  switch (level) {
    case "Closed":
      return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
    case "Ongoing":
      return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
    case "Upcoming":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
    default:
      return "bg-background/90 text-foreground";
  }
};

export function Courses() {
  const navigate = useNavigate();
  return (
    <section id="courses" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            All Scholarships
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check out all the opportunities from around the
            world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={course.image}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  className={`absolute top-4 left-4 ${getBadgeVariant(course.level)}`}
                >
                  {course.level}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-2">
                  Global Korea Scholarship
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students} students</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  variant="outline"
                  onClick={() => navigate('/scholarships')}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/scholarships')}
          >
            View All Scholarships
          </Button>
        </div>
      </div>
    </section>
  );
}