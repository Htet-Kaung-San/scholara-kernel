import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  nationality: string | null;
  residingCountry: string | null;
  educationLevel: "HIGH_SCHOOL" | "BACHELORS" | "MASTERS" | "PHD" | null;
  currentInstitution: string | null;
  personalStatement: string | null;
  studyPlan: string | null;
  interests: string[];
  achievements: string[];
  organizations: string[];
}

const COUNTRY_OPTIONS = [
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Brunei",
  "Cambodia",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Hong Kong",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Malaysia",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Pakistan",
  "Philippines",
  "Singapore",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "United Kingdom",
  "United States",
  "Vietnam",
];

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingEssays, setIsSavingEssays] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationality, setNationality] = useState("");
  const [residingCountry, setResidingCountry] = useState("");
  const [currentInstitution, setCurrentInstitution] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [personalStatement, setPersonalStatement] = useState("");
  const [studyPlan, setStudyPlan] = useState("");

  const hydrateProfileForm = (p: ProfileData | null) => {
    setFirstName(p?.firstName || user?.firstName || "");
    setLastName(p?.lastName || user?.lastName || "");
    setNationality(p?.nationality || "");
    setResidingCountry(p?.residingCountry || "");
    setCurrentInstitution(p?.currentInstitution || "");
    setEducationLevel(p?.educationLevel || "");
  };

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
        hydrateProfileForm(p);
        setPersonalStatement(p.personalStatement || "");
        setStudyPlan(p.studyPlan || "");
      }
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name are required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.patch<ProfileData>("/profiles/me", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationality: nationality.trim() || null,
        residingCountry: residingCountry.trim() || null,
        currentInstitution: currentInstitution.trim() || null,
        educationLevel: educationLevel || null,
      });

      if (res.data) {
        setProfile(res.data);
        hydrateProfileForm(res.data);
      }

      await refreshUser();
      setIsEditingProfile(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveEssays = async () => {
    setIsSavingEssays(true);
    try {
      await api.patch("/profiles/me", { personalStatement, studyPlan });
      toast.success("Essays saved!");
    } catch {
      toast.error("Failed to save essays");
    } finally {
      setIsSavingEssays(false);
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
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {!isEditingProfile ? (
                    <Button
                      className="w-full bg-black text-white hover:bg-black/90 h-11 text-base"
                      onClick={() => {
                        hydrateProfileForm(profile);
                        setIsEditingProfile(true);
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : null}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>
                    <select
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="">Select nationality</option>
                      {nationality && !COUNTRY_OPTIONS.includes(nationality) ? (
                        <option value={nationality}>{nationality}</option>
                      ) : null}
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={`nationality-${country}`} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <select
                      value={residingCountry}
                      onChange={(e) => setResidingCountry(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="">Select residing country</option>
                      {residingCountry && !COUNTRY_OPTIONS.includes(residingCountry) ? (
                        <option value={residingCountry}>{residingCountry}</option>
                      ) : null}
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={`residing-${country}`} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={currentInstitution}
                      onChange={(e) => setCurrentInstitution(e.target.value)}
                      placeholder="Current institution"
                    />
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="">Education level</option>
                      <option value="HIGH_SCHOOL">High School</option>
                      <option value="BACHELORS">Bachelor's</option>
                      <option value="MASTERS">Master's</option>
                      <option value="PHD">PhD</option>
                    </select>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          hydrateProfileForm(profile);
                          setIsEditingProfile(false);
                        }}
                        disabled={isSavingProfile}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {profile?.nationality && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Nationality</h4>
                        <p>{profile.nationality}</p>
                      </div>
                    )}

                    {profile?.currentInstitution && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Institution</h4>
                        <p>{profile.currentInstitution}</p>
                      </div>
                    )}

                    {profile?.educationLevel && (
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Education Level</h4>
                        <p>{profile.educationLevel}</p>
                      </div>
                    )}
                  </>
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
                      <Button onClick={handleSaveEssays} disabled={isSavingEssays}>
                        {isSavingEssays ? "Saving..." : "Save Changes"}
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
