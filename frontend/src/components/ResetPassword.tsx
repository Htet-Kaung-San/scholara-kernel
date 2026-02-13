import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import resetVideo from "@/assets/hide-password-password-security.webm";

function decodeErrorMessage(value: string | null) {
  if (!value) return "";
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function normalizeRecoveryError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("otp_expired") ||
    lower.includes("invalid or has expired") ||
    lower.includes("expired")
  ) {
    return "Reset link is invalid or expired. Please request a new one.";
  }
  return message;
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    const prepareRecoverySession = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashError = decodeErrorMessage(hashParams.get("error_description"));
      if (hashError) {
        setLinkError(normalizeRecoveryError(hashError));
        setIsCheckingLink(false);
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const tokenType = url.searchParams.get("type");
      const hashAccessToken = hashParams.get("access_token");
      const hashRefreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");

      if (tokenHash && tokenType === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        if (error) {
          setLinkError(normalizeRecoveryError(error.message));
          setIsCheckingLink(false);
          return;
        }
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setLinkError(normalizeRecoveryError(error.message));
          setIsCheckingLink(false);
          return;
        }
      } else if (hashAccessToken && hashRefreshToken && hashType === "recovery") {
        const { error } = await supabase.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken,
        });
        if (error) {
          setLinkError(normalizeRecoveryError(error.message));
          setIsCheckingLink(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setLinkError(normalizeRecoveryError(error.message));
      } else if (!data.session) {
        setLinkError("Reset link is invalid or expired. Please request a new one.");
      } else {
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      setIsCheckingLink(false);
    };

    void prepareRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully. Please sign in.");
      await supabase.auth.signOut();
      navigate("/signin");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-lg">
            <Card className="border-2">
              <CardContent className="p-10 space-y-6">
                <div className="overflow-hidden rounded-xl">
                  <video
                    src={resetVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-48 w-full object-contain"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
                  <p className="text-muted-foreground">
                    Choose a strong new password for your account.
                  </p>
                </div>

                {isCheckingLink ? (
                  <p className="text-center text-muted-foreground">Validating reset link...</p>
                ) : linkError ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {linkError}
                    </div>
                    <Link to="/forgot-password">
                      <Button className="w-full">Request New Reset Link</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                )}

                <div className="text-center">
                  <Link to="/signin" className="text-sm text-primary hover:underline">
                    <ArrowLeft className="inline h-3 w-3 mr-1" />
                    Back to Sign In
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
