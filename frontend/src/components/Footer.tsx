import { Separator } from "./ui/separator";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  const footerLinks = {
    "Learn": ["Browse Scholarships", "Programs", "Resources", "Mobile App"],
    "Support": ["Help Center", "Contact Us", "Student Success", "Technical Support"],
    "Company": ["About Us", "Careers", "Press", "Blog"],
    "Legal": ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"]
  };

  const legalRoutes: Record<string, string> = {
    "Privacy Policy": "/privacy",
    "Terms of Service": "/terms",
    "Browse Scholarships": "/scholarships",
    "About Us": "/about",
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
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">ScholarAid</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Empowering students worldwide with scholarship discovery and application tools.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a key={index} href={social.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={social.label}>
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, index) => (
                  <li key={index}>
                    {legalRoutes[link] ? (
                      <Link to={legalRoutes[link]}
                        className="text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{link}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScholarAid. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}