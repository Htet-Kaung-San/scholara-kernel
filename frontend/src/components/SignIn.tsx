import image_8e5ac7ade05511f1c9b5e6ee94269f9f38da06c1 from "figma:asset/8e5ac7ade05511f1c9b5e6ee94269f9f38da06c1.png";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SignInProps {
  onNavigate: (page: string) => void;
}

export function SignIn({ onNavigate }: SignInProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, just show an alert
      alert("Sign in functionality would be implemented here!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-6xl">
            <Card className="border-2">
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Sign in form */}

                <div className="space-y-4 p-[16px]">
                  <div>
                    <h2 className="text-[32px] text-center">
                      Welcome Back!!
                    </h2>
                    <p className="text-center text-[18px] pt-[0px] pr-[0px] pb-[10px] pl-[0px]">
                      Sign in to continue your learning journey
                    </p>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Email field */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange(
                              "email",
                              e.target.value,
                            )
                          }
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={
                            showPassword ? "text" : "password"
                          }
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange(
                              "password",
                              e.target.value,
                            )
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Forgot password link */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() =>
                          alert(
                            "Forgot password functionality would be implemented here!",
                          )
                        }
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {/* Sign in button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Signing in..."
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <Separator />

                  {/* Social sign in options */}
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with Google
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Sign in with Facebook
                    </Button>
                  </div>

                  <Separator />

                  {/* Sign up link */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <button
                        onClick={() => onNavigate("signup")}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign up for free
                      </button>
                    </p>
                  </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden lg:block">
                  <div className="relative h-full max-h-[550px]">
                    <ImageWithFallback
                      src={
                        image_8e5ac7ade05511f1c9b5e6ee94269f9f38da06c1
                      }
                      alt="Student studying online learning"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back to home */}
            <div className="text-center mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}