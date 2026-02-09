import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X, Bell, CheckCircle, AlertCircle, Calendar, Award } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({
  currentPage,
  onNavigate,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Application Approved!",
      message: "Your scholarship application for MIT has been approved.",
      time: "2 hours ago",
      unread: true,
      icon: CheckCircle,
    },
    {
      id: 2,
      type: "info", 
      title: "New Scholarship Available",
      message: "A new computer science scholarship is now available.",
      time: "1 day ago",
      unread: true,
      icon: Award,
    },
    {
      id: 3,
      type: "warning",
      title: "Deadline Reminder",
      message: "Your Stanford application deadline is in 3 days.",
      time: "2 days ago",
      unread: false,
      icon: Calendar,
    },
    {
      id: 4,
      type: "alert",
      title: "Document Required",
      message: "Please upload your transcripts to complete your profile.",
      time: "3 days ago",
      unread: false,
      icon: AlertCircle,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
    setIsNotificationOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isNotificationOpen || isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen, isProfileDropdownOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavigation("home")}
                className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
              >
                ScholarAid
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => handleNavigation("home")}
                className={`hover:text-primary transition-colors ${currentPage === "home" ? "text-primary font-medium" : ""}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("about")}
                className={`hover:text-primary transition-colors ${currentPage === "about" ? "text-primary font-medium" : ""}`}
              >
                About
              </button>
              <button
                onClick={() => handleNavigation("pricing")}
                className={`hover:text-primary transition-colors ${currentPage === "pricing" ? "text-primary font-medium" : ""}`}
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigation("onboarding")}
                className={`hover:text-primary transition-colors ${currentPage === "onboarding" ? "text-primary font-medium" : ""}`}
              >
                Get Started
              </button>
              {currentPage === "home" && (
                <>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#courses"
                    className="hover:text-primary transition-colors"
                  >
                    Courses
                  </a>
                  <a
                    href="#testimonials"
                    className="hover:text-primary transition-colors"
                  >
                    Reviews
                  </a>
                </>
              )}
            </div>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <Card className="absolute right-0 top-full mt-2 w-80 shadow-lg z-50">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const Icon = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer ${
                                notification.unread ? "bg-blue-50/50" : ""
                              }`}
                            >
                              <div className={`p-1 rounded-full ${
                                notification.type === "success" ? "text-green-600" :
                                notification.type === "info" ? "text-blue-600" :
                                notification.type === "warning" ? "text-yellow-600" :
                                "text-red-600"
                              }`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-sm truncate">
                                    {notification.title}
                                  </p>
                                  {notification.unread && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-4 border-t">
                      <Button variant="ghost" className="w-full text-sm" onClick={() => onNavigate?.('notifications')}>
                        View all notifications
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* User Avatar */}
            <div className="relative" ref={profileRef}>
              <Avatar 
                className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <AvatarImage src="" alt="User Avatar" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  JS
                </AvatarFallback>
              </Avatar>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <Card className="absolute right-0 top-full mt-2 w-56 shadow-lg z-50">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="User Avatar" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          JS
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">John Smith</p>
                        <p className="text-xs text-muted-foreground truncate">john.smith@email.com</p>
                      </div>
                    </div>
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("profile");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          👤
                        </div>
                        Profile
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("applications");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          📄
                        </div>
                        My Applications
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("documents");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          📁
                        </div>
                        Documents
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("admin");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          🛡️
                        </div>
                        Admin Dashboard
                      </button>
                      <div className="border-t my-2"></div>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("settings");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          ⚙️
                        </div>
                        Settings
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          // Handle help navigation
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          ❓
                        </div>
                        Help & Support
                      </button>
                      <div className="border-t my-2"></div>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleNavigation("signin");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors text-red-600"
                      >
                        <div className="w-4 h-4 flex items-center justify-center">
                          🚪
                        </div>
                        Sign out
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => handleNavigation("signin")}
            >
              Sign In
            </Button>
            <Button onClick={() => handleNavigation("signup")}>
              Register
            </Button>
          </div>

          {/* Mobile menu and notification */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile User Avatar */}
            <Avatar 
              className="h-7 w-7 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleNavigation("profile")}
            >
              <AvatarImage src="" alt="User Avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                JS
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <button
                onClick={() => handleNavigation("home")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${currentPage === "home" ? "text-primary font-medium" : ""}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("about")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${currentPage === "about" ? "text-primary font-medium" : ""}`}
              >
                About
              </button>
              <button
                onClick={() => handleNavigation("pricing")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${currentPage === "pricing" ? "text-primary font-medium" : ""}`}
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigation("onboarding")}
                className={`block w-full text-left px-3 py-2 hover:text-primary transition-colors ${currentPage === "onboarding" ? "text-primary font-medium" : ""}`}
              >
                Get Started
              </button>
              {currentPage === "home" && (
                <>
                  <a
                    href="#features"
                    className="block px-3 py-2 hover:text-primary transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#courses"
                    className="block px-3 py-2 hover:text-primary transition-colors"
                  >
                    Courses
                  </a>
                  <a
                    href="#testimonials"
                    className="block px-3 py-2 hover:text-primary transition-colors"
                  >
                    Reviews
                  </a>
                </>
              )}
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation("signin")}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNavigation("signup")}
                >
                  Register
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}