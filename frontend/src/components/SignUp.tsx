import image_d353e1ff4a94d38a40b2f63fc960d97c0244d079 from "figma:asset/d353e1ff4a94d38a40b2f63fc960d97c0244d079.png";
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
import { Checkbox } from "./ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SignUpProps {
  onNavigate: (page: string) => void;
}

export function SignUp({ onNavigate }: SignUpProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the terms and conditions!");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to onboarding after successful signup
      onNavigate("onboarding");
    }, 1000);
  };

  const benefits = [
    "Access to 200+ premium courses",
    "Learn from industry experts",
    "Earn certificates upon completion",
    "Join a community of 50,000+ learners",
    "Mobile and desktop access",
    "Lifetime access to purchased courses",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-6xl">
            <Card className="border-2">
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left side - Sign up form */}

                <div className="space-y-4 p-[16px]">
                  <div>
                    <h2 className="text-[32px] text-center">
                      Welcome to ScholarAid
                    </h2>
                    <p className="text-center text-[18px] pt-[0px] pr-[0px] pb-[10px] pl-[0px]">
                      Let us guide your way through a world of
                      opportunities
                    </p>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {/* Name fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange(
                                "firstName",
                                e.target.value,
                              )
                            }
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange(
                              "lastName",
                              e.target.value,
                            )
                          }
                          required
                        />
                      </div>
                    </div>

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
                          placeholder="Create a strong password"
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

                    {/* Confirm Password field */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleInputChange(
                              "confirmPassword",
                              e.target.value,
                            )
                          }
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword,
                            )
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms and conditions */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={setAcceptTerms}
                        className="mt-1"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm leading-5"
                      >
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => onNavigate?.('terms')}
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => onNavigate?.('privacy')}
                        >
                          Privacy Policy
                        </button>
                      </Label>
                    </div>

                    {/* Sign up button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || !acceptTerms}
                    >
                      {isLoading ? (
                        "Creating account..."
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <Separator />

                  {/* Social sign up options */}
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
                      Sign up with Google
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
                      Sign up with Facebook
                    </Button>
                  </div>

                  <Separator />

                  {/* Sign in link */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => onNavigate("signin")}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in here
                      </button>
                    </p>
                  </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden lg:block">
                  <div className="relative h-full min-h-[600px]">
                    <ImageWithFallback
                      src={
                        image_d353e1ff4a94d38a40b2f63fc960d97c0244d079
                      }
                      alt="Students learning and achieving success"
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