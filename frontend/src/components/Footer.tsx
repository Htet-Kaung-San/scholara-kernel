import { Separator } from "./ui/separator";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const footerLinks = {
    "Learn": [
      "Browse Courses",
      "Certification Programs",
      "Learning Paths",
      "Mobile App"
    ],
    "Support": [
      "Help Center",
      "Contact Us",
      "Student Success",
      "Technical Support"
    ],
    "Company": [
      "About Us",
      "Careers",
      "Press",
      "Blog"
    ],
    "Legal": [
      "Privacy Policy",
      "Terms of Service",
      "Cookie Policy",
      "Accessibility"
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">EduLearn</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Empowering learners worldwide with high-quality education and 
              practical skills for career advancement.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => {
                        if (link === "Privacy Policy") {
                          onNavigate?.('privacy');
                        } else if (link === "Terms of Service") {
                          onNavigate?.('terms');
                        }
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 EduLearn. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <button 
              onClick={() => onNavigate?.('privacy')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => onNavigate?.('terms')}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </button>
            <button className="text-muted-foreground hover:text-primary transition-colors">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}