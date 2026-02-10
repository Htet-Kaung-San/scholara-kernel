import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Search, Clock, MapPin, DollarSign, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { api, type ApiResponse } from "@/lib/api";

interface Scholarship {
  id: string;
  title: string;
  provider: string;
  country: string;
  amount: number;
  currency: string;
  deadline: string;
  status: string;
  type: string;
  educationLevel: string[];
  description: string;
  featured: boolean;
  _count?: { applications: number };
}

export function AllScholarships() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
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
        sortOrder: "asc",
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
      case "OPEN": return "default" as const;
      case "CLOSED": return "secondary" as const;
      case "UPCOMING": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="amount">Amount</SelectItem>
              <SelectItem value="createdAt">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <SlidersHorizontal className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-6" />
                  <div className="h-3 bg-muted rounded w-full mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships.map((scholarship) => (
                <Card
                  key={scholarship.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={getBadgeVariant(scholarship.status)}>
                        {scholarship.status}
                      </Badge>
                      {scholarship.featured && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{scholarship.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{scholarship.provider}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{scholarship.country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatAmount(scholarship.amount, scholarship.currency)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Deadline: {formatDate(scholarship.deadline)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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