import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Developer",
    company: "Tech Solutions Inc.",
    avatar: "SJ",
    rating: 5,
    content: "EduLearn transformed my career completely. The web development course was comprehensive and the instructors were incredibly supportive. I landed my dream job within 3 months of completing the program!"
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    company: "Analytics Pro",
    avatar: "MC",
    rating: 5,
    content: "The data science course exceeded my expectations. The practical projects and real-world applications helped me build a strong portfolio that impressed employers. Highly recommended!"
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    company: "Growth Agency",
    avatar: "ER",
    rating: 5,
    content: "As someone with no prior marketing experience, I was amazed at how well-structured the digital marketing course was. The step-by-step approach made complex concepts easy to understand."
  },
  {
    name: "David Thompson",
    role: "Freelance Designer",
    company: "Self-employed",
    avatar: "DT",
    rating: 5,
    content: "The flexibility of EduLearn allowed me to learn while working full-time. The quality of content and the community support made all the difference in my learning journey."
  },
  {
    name: "Lisa Wang",
    role: "Product Manager",
    company: "Innovation Labs",
    avatar: "LW",
    rating: 5,
    content: "The courses are up-to-date with industry standards and the instructors bring real-world experience. I gained practical skills that I use daily in my current role."
  },
  {
    name: "James Brown",
    role: "Business Analyst",
    company: "Consulting Group",
    avatar: "JB",
    rating: 5,
    content: "EduLearn's approach to learning is fantastic. The combination of theory and hands-on practice prepared me well for the challenges in my new career path."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-secondary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Students Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our successful students 
            have to say about their learning experience with EduLearn.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`} />
                    <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}