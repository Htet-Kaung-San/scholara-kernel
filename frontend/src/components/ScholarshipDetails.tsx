import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, Calendar, Globe, DollarSign, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  type: string;
  level: string;
  duration?: string | null;
  tuitionWaiver?: string | null;
  monthlyStipend?: string | null;
  applicationFee?: string | null;
  flightTicket?: string | null;
  maxAge?: number | null;
  openDate?: string | null;
  applicationDeadLine?: string | null;
  deadline?: string | null;
  status: string;
  description?: string | null;
  eligibility?: unknown;
  benefits?: unknown;
  requirements?: unknown;
  timeline?: unknown;
  featured: boolean;
  _count?: { applications: number };
}

function stringifyRichContent(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join("\n");
  }
  return JSON.stringify(value, null, 2);
}

export function ScholarshipDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) fetchScholarship();
  }, [id]);

  const fetchScholarship = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<Scholarship>(`/scholarships/${id}`);
      setScholarship(res.data || null);
    } catch {
      toast.error("Scholarship not found");
      navigate("/scholarships");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    setIsApplying(true);
    try {
      await api.post("/applications", { scholarshipId: id });
      toast.success("Application submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const formatSupport = (s: Scholarship) => {
    const support = [s.tuitionWaiver, s.monthlyStipend].filter(Boolean).join(" • ");
    return support || "See benefits below";
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Not specified";
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return "Not specified";
    return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-12 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!scholarship) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/scholarships")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Scholarships
          </Button>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={scholarship.status === "OPEN" ? "default" : "secondary"}>
                  {scholarship.status}
                </Badge>
                <Badge variant="outline">{scholarship.type}</Badge>
                {scholarship.featured && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">⭐ Featured</Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-2">{scholarship.title}</h1>
              <p className="text-muted-foreground mb-4">{scholarship.provider}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarship.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDate(scholarship.applicationDeadLine ?? scholarship.deadline)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatSupport(scholarship)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{scholarship._count?.applications || 0} applicants</span>
                </div>
              </div>

              <Button
                className="bg-black text-white hover:bg-gray-800 px-8"
                onClick={handleApply}
                disabled={isApplying || scholarship.status !== "OPEN"}
              >
                {isApplying ? "Submitting..." : scholarship.status === "OPEN" ? "Apply Now" : "Applications Closed"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility & Benefits</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader><CardTitle>About this Scholarship</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap">
                  {scholarship.description || "No description provided yet."}
                </p>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Level</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{scholarship.level || "Not specified"}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Key Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Duration: {scholarship.duration || "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Application Fee: {scholarship.applicationFee || "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Flight Ticket: {scholarship.flightTicket || "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Max Age: {scholarship.maxAge ?? "Not specified"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Opening Date: {formatDate(scholarship.openDate)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eligibility" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Eligibility</CardTitle></CardHeader>
                <CardContent>
                  {stringifyRichContent(scholarship.eligibility) ? (
                    <p className="whitespace-pre-wrap">{stringifyRichContent(scholarship.eligibility)}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Eligibility criteria not specified. Please check the scholarship provider details.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
                <CardContent>
                  {stringifyRichContent(scholarship.benefits) ? (
                    <p className="whitespace-pre-wrap">{stringifyRichContent(scholarship.benefits)}</p>
                  ) : (
                    <p className="text-muted-foreground">Benefit details not specified.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Application Requirements</CardTitle></CardHeader>
              <CardContent>
                {stringifyRichContent(scholarship.requirements) ? (
                  <p className="whitespace-pre-wrap">{stringifyRichContent(scholarship.requirements)}</p>
                ) : (
                  <p className="text-muted-foreground">Requirements not specified. Contact the scholarship provider for details.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h3 className="mb-4 text-xl font-bold">Ready to Apply?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Take the first step towards your academic future.
              </p>
              <Button
                className="bg-black text-white hover:bg-gray-800 px-8 py-3"
                onClick={handleApply}
                disabled={isApplying || scholarship.status !== "OPEN"}
              >
                {isApplying ? "Submitting..." : "Start Your Application"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
