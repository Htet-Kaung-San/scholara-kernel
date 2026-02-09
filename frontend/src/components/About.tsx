import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Users, Target, Heart, Award, BookOpen, Globe } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const stats = [
  { number: "50,000+", label: "Students Worldwide" },
  { number: "500+", label: "Expert Instructors" },
  { number: "200+", label: "Courses Available" },
  { number: "95%", label: "Success Rate" }
];

const values = [
  {
    icon: BookOpen,
    title: "Quality Education",
    description: "We believe every student deserves access to high-quality, engaging educational content that transforms lives."
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Breaking down barriers to education by making learning accessible to students around the world."
  },
  {
    icon: Heart,
    title: "Student-Centered",
    description: "Everything we do is designed with our students' success and learning journey at the heart of our decisions."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We maintain the highest standards in course content, instruction quality, and learning outcomes."
  }
];

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    description: "Former Stanford professor with 15+ years in educational technology.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b96c?w=400"
  },
  {
    name: "Michael Chen",
    role: "Head of Curriculum",
    description: "Educational design expert who has developed curricula for top universities.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
  },
  {
    name: "Emily Rodriguez",
    role: "VP of Engineering",
    description: "Tech leader passionate about building scalable learning platforms.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
  }
];

export function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary">About EduLearn</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Empowering Learning 
                <span className="text-primary"> Everywhere</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Founded in 2020, EduLearn has been on a mission to democratize education 
                and make high-quality learning accessible to everyone, everywhere. We believe 
                that knowledge should have no boundaries.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl lg:text-3xl font-bold text-primary mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBtaXNzaW9uJTIwaW5zcGlyYXRpb24lMjBsZWFybmluZ3xlbnwxfHx8fDE3NTg0MTkzMjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Education mission and inspiration"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              To break down the barriers that prevent people from accessing quality education 
              and to create a world where anyone, anywhere can learn the skills they need to 
              succeed in life and career.
            </p>
            <div className="bg-card p-8 rounded-2xl shadow-lg">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-4">
                Education for All
              </h3>
              <p className="text-muted-foreground">
                We envision a future where geographical location, economic status, or background 
                doesn't determine access to education. Through technology and innovation, we're 
                making this vision a reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and help us stay true to our mission 
              of transforming education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passionate educators, technologists, and innovators working together 
              to revolutionize learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="relative mx-auto mb-4">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <Badge variant="secondary" className="mx-auto">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {member.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1676276376345-ee600f57b5b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGVhbSUyMGVkdWNhdGlvbiUyMGNvbGxhYm9yYXRpb258ZW58MXx8fHwxNzU4NDE5MzIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Diverse team collaboration"
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  EduLearn was born from a simple observation: too many talented individuals 
                  were being held back by limited access to quality education. Our founder, 
                  Sarah Johnson, experienced this firsthand when she couldn't access advanced 
                  courses in her rural hometown.
                </p>
                <p className="text-lg text-muted-foreground">
                  After years of teaching at Stanford and witnessing the transformative power 
                  of education, Sarah decided to build a platform that could reach students 
                  everywhere. What started as a small team of educators and developers has 
                  grown into a global community.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, we're proud to serve students in over 190 countries, offering courses 
                  in multiple languages and continuously expanding our reach to underserved 
                  communities worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}