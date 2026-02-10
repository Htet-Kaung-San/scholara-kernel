import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSent(true);
            toast.success("Password reset email sent!");
        } catch (err: any) {
            toast.error(err.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="w-full max-w-md">
                        <Card className="border-2">
                            <CardContent className="p-8 space-y-6">
                                {sent ? (
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                            <Mail className="h-8 w-8 text-primary" />
                                        </div>
                                        <h2 className="text-2xl font-bold">Check your email</h2>
                                        <p className="text-muted-foreground">
                                            We've sent a password reset link to <strong>{email}</strong>.
                                            Check your inbox and follow the instructions.
                                        </p>
                                        <Link to="/signin">
                                            <Button variant="outline" className="w-full mt-4">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Sign In
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
                                            <p className="text-muted-foreground">
                                                Enter your email and we'll send you a reset link.
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="pl-10"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full" disabled={isLoading}>
                                                {isLoading ? "Sending..." : "Send Reset Link"}
                                            </Button>
                                        </form>

                                        <div className="text-center">
                                            <Link to="/signin" className="text-sm text-primary hover:underline">
                                                <ArrowLeft className="inline h-3 w-3 mr-1" />
                                                Back to Sign In
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
