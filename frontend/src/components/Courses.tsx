import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Clock, Users } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";
import { api } from "@/lib/api";

interface Scholarship {
  id: string;
  title: string;
  imageUrl?: string | null;
  status: string;
  duration?: string | null;
  applicationDeadLine?: string | null;
  deadline?: string | null;
  _count?: {
    applications: number;
  };
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1566314748815-2ff5db8edf2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1758270703081-3e1595e2b864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "https://images.unsplash.com/photo-1758270704587-43339a801396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
];

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

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "CLOSED":
      return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
    case "OPEN":
      return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
    case "UPCOMING":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
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

export function Courses() {
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<Scholarship[]>("/scholarships", {
          limit: "3",
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        setScholarships((res.data || []).slice(0, 3));
      } catch {
        setScholarships([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  return (
    <section id="courses" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            All Scholarships
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check out all the opportunities from around the
            world.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="animate-pulse overflow-hidden">
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
        ) : scholarships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scholarships.map((scholarship, index) => {
              const imageUrl = parseImageUrls(scholarship.imageUrl)[0] || fallbackImages[index % fallbackImages.length];
              return (
                <Card
                  key={scholarship.id}
                  className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/scholarships/${scholarship.id}`)}
                >
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={imageUrl}
                      alt={scholarship.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className={`absolute top-4 left-4 ${getBadgeVariant(scholarship.status)}`}>
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
                      className="w-full bg-black text-white hover:bg-gray-800"
                      variant="outline"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/scholarships/${scholarship.id}`);
                      }}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Scholarships will appear here soon.
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/scholarships')}
          >
            View All Scholarships
          </Button>
        </div>
      </div>
    </section>
  );
}
