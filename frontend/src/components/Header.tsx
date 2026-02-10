import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentPage = location.pathname;

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  const isActive = (path: string) => currentPage === path;

  const navLinkClass = (path: string) =>
    `relative px-3 py-2 rounded-md transition-all hover:bg-primary/10 hover:text-primary ${isActive(path) ? "bg-primary/10 text-primary font-medium" : ""
    }`;

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
              >
                ScholarAid
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button onClick={() => handleNavigation("/features")} className={navLinkClass("/features")}>
                Features
              </button>
              <button onClick={() => handleNavigation("/scholarships")} className={navLinkClass("/scholarships")}>
                Scholarships
              </button>
              <button onClick={() => handleNavigation("/events")} className={navLinkClass("/events")}>
                Events
              </button>
              <button onClick={() => handleNavigation("/pricing")} className={navLinkClass("/pricing")}>
                Pricing
              </button>
            </div>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("/notifications")}
                  className="flex items-center gap-2"
                >
                  🔔 Notifications
                </Button>

                {/* Profile Avatar + Dropdown */}
                <div className="relative" ref={profileRef}>
                  <Avatar
                    className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsProfileDropdownOpen((v) => !v)}
                  >
                    <AvatarImage src={user.avatarUrl || ""} alt="User Avatar" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>

                  {isProfileDropdownOpen && (
                    <Card className="absolute right-0 mt-2 w-64 shadow-lg">
                      <CardContent className="p-2">
                        <div className="px-4 py-2 border-b mb-1">
                          <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => handleNavigation("/profile")}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                          >
                            👤 Profile
                          </button>
                          <button
                            onClick={() => handleNavigation("/notifications")}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                          >
                            🔔 Notifications
                          </button>

                          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                            <button
                              onClick={() => handleNavigation("/admin")}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                            >
                              🛡️ Admin Dashboard
                            </button>
                          )}

                          <div className="border-t my-2" />

                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-red-600"
                          >
                            🚪 Sign out
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleNavigation("/signin")}>
                  Sign In
                </Button>
                <Button onClick={() => handleNavigation("/signup")}>Register</Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && user && (
              <Avatar
                className="h-7 w-7 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleNavigation("/profile")}
              >
                <AvatarImage src={user.avatarUrl || ""} alt="User Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            )}

            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <button
                onClick={() => handleNavigation("/")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${isActive("/") ? "text-primary font-medium" : ""}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("/features")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${isActive("/features") ? "text-primary font-medium" : ""}`}
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("/scholarships")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${isActive("/scholarships") ? "text-primary font-medium" : ""}`}
              >
                Scholarships
              </button>
              <button
                onClick={() => handleNavigation("/events")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${isActive("/events") ? "text-primary font-medium" : ""}`}
              >
                Events
              </button>
              <button
                onClick={() => handleNavigation("/pricing")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${isActive("/pricing") ? "text-primary font-medium" : ""}`}
              >
                Pricing
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => handleNavigation("/notifications")}
                    className="block w-full text-left px-3 py-2 hover:text-primary transition-colors"
                  >
                    Notifications
                  </button>
                  <div className="flex flex-col space-y-2 px-3 py-2">
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <Button variant="ghost" size="sm" onClick={() => handleNavigation("/signin")}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => handleNavigation("/signup")}>
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
