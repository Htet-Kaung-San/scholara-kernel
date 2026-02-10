import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ProfileData {
  id: string;
  bio: string | null;
  nationality: string | null;
  country: string | null;
  educationLevel: string | null;
  institution: string | null;
  personalStatement: string | null;
  studyPlan: string | null;
  interests: string[];
  achievements: string[];
  organizations: string[];
}

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [personalStatement, setPersonalStatement] = useState("");
  const [studyPlan, setStudyPlan] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ProfileData>("/profiles/me");
      const p = res.data;
      if (p) {
        setProfile(p);
        setPersonalStatement(p.personalStatement || "");
        setStudyPlan(p.studyPlan || "");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch("/profiles/me", { personalStatement, studyPlan });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-center">
                  <Avatar className="w-32 h-32 border-4 border-border">
                    <AvatarImage src={user?.avatarUrl || ""} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      <User className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>

                {profile?.nationality && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Nationality</h4>
                    <p>{profile.nationality}</p>
                  </div>
                )}

                {profile?.institution && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Institution</h4>
                    <p>{profile.institution}</p>
                  </div>
                )}

                {profile?.educationLevel && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Education Level</h4>
                    <p>{profile.educationLevel}</p>
                  </div>
                )}

                {profile?.interests && profile.interests.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Interests</h4>
                    <div className="flex gap-2 flex-wrap">
                      {profile.interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile?.organizations && profile.organizations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Organizations</h4>
                    <div className="flex gap-2 flex-wrap">
                      {profile.organizations.map((org, i) => (
                        <Badge key={i} variant="outline" className="rounded-full px-4 py-2 text-sm">
                          {org}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-3">
            <Card className="border-2">
              <CardContent className="p-6">
                <Tabs defaultValue="essays" className="w-full">
                  <div className="mb-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="essays">Essays</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="applications">Applications</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="essays" className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Personal Statement</h3>
                      <Textarea
                        placeholder="Write your personal statement here..."
                        value={personalStatement}
                        onChange={(e) => setPersonalStatement(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Study Plan</h3>
                      <Textarea
                        placeholder="Describe your study plan here..."
                        value={studyPlan}
                        onChange={(e) => setStudyPlan(e.target.value)}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents">
                    <div className="text-center py-12 text-muted-foreground">
                      Documents section coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="applications">
                    <div className="text-center py-12 text-muted-foreground">
                      Your applications will appear here.
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}