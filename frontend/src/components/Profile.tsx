import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { Plus, User } from "lucide-react";

export function Profile() {
  const [personalStatement, setPersonalStatement] =
    useState("");
  const [studyPlan, setStudyPlan] = useState("");

  const achievements = [
    "Bago East Region No.7",
    "Bago East Region No.7",
    "Bago East Region No.7",
    "...",
  ];

  const highlights = [
    "2017 hackathon winner",
    "2017 hackathon winner",
    "2017 hackathon winner",
    "...",
  ];

  const organizations = ["YTU", "NUS", "MIT"];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-border">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        <User className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-2">
                  <h3 className="text-lg">hksamm</h3>
                  <p className="text-muted-foreground">
                    Htet Kaung San
                  </p>
                </div>

                {/* Achievements */}
                <div className="space-y-3">
                  <h4 className="text-base">Achievements</h4>
                  <ul className="space-y-1">
                    {achievements.map((achievement, index) => (
                      <li
                        key={index}
                        className="flex items-start"
                      >
                        <span className="text-sm mr-2">•</span>
                        <span className="text-sm text-muted-foreground">
                          {achievement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <h4 className="text-base">Highlights</h4>
                  <ul className="space-y-1">
                    {highlights.map((highlight, index) => (
                      <li
                        key={index}
                        className="flex items-start"
                      >
                        <span className="text-sm mr-2">•</span>
                        <span className="text-sm text-muted-foreground">
                          {highlight}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Organizations */}
                <div className="space-y-3">
                  <h4 className="text-base">Organisations</h4>
                  <div className="flex gap-2 flex-wrap">
                    {organizations.map((org, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="rounded-full px-4 py-2 text-sm"
                      >
                        {org}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Essays and Documents */}
          <div className="lg:col-span-3">
            <Card className="border-2">
              <CardContent className="p-6">
                <Tabs defaultValue="essays" className="w-full">
                  <div className="mb-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="essays">
                        Essays
                      </TabsTrigger>
                      <TabsTrigger value="documents">
                        Documents
                      </TabsTrigger>
                      <TabsTrigger value="projects">
                        Projects
                      </TabsTrigger>
                      <TabsTrigger value="applications">
                        Applications
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="essays"
                    className="space-y-6"
                  >
                    {/* Personal Statement */}
                    <div className="space-y-3">
                      <h3 className="text-lg">
                        Personal Statement
                      </h3>
                      <Textarea
                        placeholder="Write your personal statement here..."
                        value={personalStatement}
                        onChange={(e) =>
                          setPersonalStatement(e.target.value)
                        }
                        className="min-h-[200px] resize-none"
                      />
                    </div>

                    {/* Study Plan */}
                    <div className="space-y-3">
                      <h3 className="text-lg">Study Plan</h3>
                      <Textarea
                        placeholder="Describe your study plan here..."
                        value={studyPlan}
                        onChange={(e) =>
                          setStudyPlan(e.target.value)
                        }
                        className="min-h-[200px] resize-none"
                      />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <Button>Save Changes</Button>
                    </div>
                  </TabsContent>

                  {/* Placeholder content for other tabs */}
                  <TabsContent value="documents">
                    <div className="text-center py-12 text-muted-foreground">
                      Documents section coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations">
                    <div className="text-center py-12 text-muted-foreground">
                      Recommendations section coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="transcripts">
                    <div className="text-center py-12 text-muted-foreground">
                      Transcripts section coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="portfolio">
                    <div className="text-center py-12 text-muted-foreground">
                      Portfolio section coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent value="other">
                    <div className="text-center py-12 text-muted-foreground">
                      Other documents section coming soon...
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