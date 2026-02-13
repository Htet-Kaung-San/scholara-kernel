import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Clock, SlidersHorizontal, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "@/lib/api";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  imageUrl?: string | null;
  country: string;
  status: string;
  type: string;
  level: string;
  duration?: string | null;
  tuitionWaiver?: string | null;
  monthlyStipend?: string | null;
  applicationDeadLine?: string | null;
  deadline?: string | null;
  featured: boolean;
  _count?: { applications: number };
}

function parseImageUrls(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    // Keep compatibility with legacy single-string URL data.
  }

  if (raw.includes(",")) {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [raw];
}

export function AllScholarships() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("applicationDeadLine");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchScholarships();
  }, [page, sortBy]);

  const fetchScholarships = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "12",
        sortBy,
        sortOrder: sortBy === "createdAt" ? "desc" : "asc",
      };
      if (searchTerm) params.search = searchTerm;
      if (country !== "all") params.country = country;
      if (type !== "all") params.type = type;

      const res = await api.get<Scholarship[]>("/scholarships", params);
      setScholarships(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch {
      setScholarships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchScholarships();
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "CLOSED":
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      case "UPCOMING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      case "OPEN":
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      default:
        return "bg-background/90 text-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "OPEN") return "Open";
    if (status === "CLOSED") return "Closed";
    if (status === "UPCOMING") return "Upcoming";
    return status || "Unknown";
  };

  const getDurationLabel = (scholarship: Scholarship) => {
    if (scholarship.duration?.trim()) return scholarship.duration;

    const dateStr = scholarship.applicationDeadLine ?? scholarship.deadline;
    if (!dateStr) return "Flexible";

    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return "Flexible";

    const now = new Date();
    const diffMs = parsed.getTime() - now.getTime();
    const weeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    if (weeks <= 0) return "Closed";
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Scholarships</h1>
          <p className="text-muted-foreground">Discover opportunities that match your profile</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Select value={country} onValueChange={(v: string) => { setCountry(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="South Korea">South Korea</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
              <SelectItem value="UK">UK</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={(v: string) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="GOVERNMENT">Government</SelectItem>
              <SelectItem value="UNIVERSITY">University</SelectItem>
              <SelectItem value="PRIVATE">Private</SelectItem>
              <SelectItem value="NGO">NGO</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="applicationDeadLine">Closing Date</SelectItem>
              <SelectItem value="deadline">Legacy Deadline</SelectItem>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="h-48 bg-muted" />
                <CardContent className="p-6">
                  <div className="h-7 bg-muted rounded w-2/3 mb-4" />
                  <div className="flex justify-between mb-4">
                    <div className="h-4 bg-muted rounded w-20" />
                    <div className="h-4 bg-muted rounded w-24" />
                  </div>
                  <div className="h-10 bg-muted rounded-md w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {scholarships.map((scholarship) => {
                const primaryImage = parseImageUrls(scholarship.imageUrl)[0];
                return (
                  <Card
                    key={scholarship.id}
                    className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
                    onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                  >
                    <div className="relative overflow-hidden">
                      {primaryImage ? (
                        <ImageWithFallback
                          src={primaryImage}
                          alt={scholarship.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300" />
                      )}
                      <Badge
                        className={`absolute top-4 left-4 ${getBadgeVariant(scholarship.status)}`}
                      >
                        {getStatusLabel(scholarship.status)}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-2">
                        {scholarship.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{getDurationLabel(scholarship)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{(scholarship._count?.applications ?? 0).toLocaleString()} students</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-black text-white hover:bg-gray-800"
                        variant="outline"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
