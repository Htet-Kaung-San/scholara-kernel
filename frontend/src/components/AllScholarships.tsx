import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign,
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import exampleImage from 'figma:asset/87043102cbafea83106ad2a3d85a05ae96945c9c.png';

interface AllScholarshipsProps {
  onNavigate?: (page: string) => void;
}

const scholarships = [
  {
    id: 1,
    title: "Global Korea Scholarship",
    provider: "Korean Government",
    country: "South Korea",
    description: "Full scholarship for international students to study undergraduate and graduate programs in Korean universities.",
    image: "https://images.unsplash.com/photo-1686100510591-b5d5d4113bc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB1bml2ZXJzaXR5JTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc1ODgyMTY2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Closed",
    level: "Undergraduate/Graduate",
    duration: "12 weeks",
    students: "2,340 students",
    deadline: "March 31, 2024",
    value: "Full tuition + Living allowance",
    fieldOfStudy: "All Fields",
    type: "Government"
  },
  {
    id: 2,
    title: "Global Korea Scholarship",
    provider: "Korean Government", 
    country: "South Korea",
    description: "Comprehensive scholarship program covering tuition, living expenses, and language training for international students.",
    image: "https://images.unsplash.com/photo-1758270703939-76ec979cbc65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjBzdHVkZW50cyUyMGNhcHN8ZW58MXx8fHwxNzU4NzgxNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Ongoing",
    level: "Graduate",
    duration: "16 weeks", 
    students: "1,856 students",
    deadline: "May 15, 2024",
    value: "Full coverage",
    fieldOfStudy: "STEM",
    type: "Government"
  },
  {
    id: 3,
    title: "Global Korea Scholarship",
    provider: "Korean Government",
    country: "South Korea", 
    description: "Premium scholarship opportunity for outstanding international students seeking quality education in Korea.",
    image: "https://images.unsplash.com/photo-1757192420329-39acf20a12b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwbGVjdHVyZSUyMGhhbGx8ZW58MXx8fHwxNzU4Nzk2NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Upcoming",
    level: "Undergraduate",
    duration: "8 weeks",
    students: "3,204 students", 
    deadline: "August 30, 2024",
    value: "Partial funding",
    fieldOfStudy: "Arts & Humanities",
    type: "University"
  },
  {
    id: 4,
    title: "DAAD German Academic Exchange",
    provider: "German Government",
    country: "Germany",
    description: "Scholarship for international students to pursue higher education in Germany with full financial support.",
    image: "https://images.unsplash.com/photo-1686100510591-b5d5d4113bc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB1bml2ZXJzaXR5JTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc1ODgyMTY2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Ongoing",
    level: "Graduate",
    duration: "24 weeks",
    students: "5,120 students",
    deadline: "October 15, 2024",
    value: "Full tuition + Stipend",
    fieldOfStudy: "Engineering",
    type: "Government"
  },
  {
    id: 5,
    title: "Chevening Scholarship UK",
    provider: "UK Government",
    country: "United Kingdom",
    description: "Prestigious scholarship for future leaders to study master's degree programs in the UK.",
    image: "https://images.unsplash.com/photo-1757192420329-39acf20a12b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2xhc3Nyb29tJTIwbGVjdHVyZSUyMGhhbGx8ZW58MXx8fHwxNzU4Nzk2NjYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Upcoming",
    level: "Graduate",
    duration: "52 weeks",
    students: "1,500 students",
    deadline: "November 2, 2024",
    value: "Full coverage",
    fieldOfStudy: "All Fields",
    type: "Government"
  },
  {
    id: 6,
    title: "Fulbright Foreign Student Program",
    provider: "US Government",
    country: "United States",
    description: "World-renowned scholarship program for international students to study in the United States.",
    image: "https://images.unsplash.com/photo-1758270703939-76ec979cbc65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjBzdHVkZW50cyUyMGNhcHN8ZW58MXx8fHwxNzU4NzgxNjA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "Closed",
    level: "Graduate",
    duration: "36 weeks",
    students: "4,000 students",
    deadline: "October 15, 2023",
    value: "Full tuition + Living costs",
    fieldOfStudy: "All Fields",
    type: "Government"
  }
];

const getBadgeVariant = (status: string) => {
  switch (status) {
    case "Closed":
      return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
    case "Ongoing":
      return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
    case "Upcoming":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
    default:
      return "bg-background/90 text-foreground";
  }
};

export function AllScholarships({ onNavigate }: AllScholarshipsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const filteredScholarships = useMemo(() => {
    let filtered = scholarships;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(scholarship =>
        scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scholarship.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(scholarship => 
        scholarship.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(scholarship => 
        scholarship.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Country filter  
    if (countryFilter !== "all") {
      filtered = filtered.filter(scholarship => 
        scholarship.country.toLowerCase() === countryFilter.toLowerCase()
      );
    }

    // Field filter
    if (fieldFilter !== "all") {
      filtered = filtered.filter(scholarship => 
        scholarship.fieldOfStudy.toLowerCase() === fieldFilter.toLowerCase()
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(scholarship => 
        scholarship.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    return filtered;
  }, [searchQuery, statusFilter, countryFilter, fieldFilter, typeFilter, activeTab]);

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCountryFilter("all");
    setFieldFilter("all");
    setTypeFilter("all");
    setActiveTab("all");
  };

  const uniqueCountries = [...new Set(scholarships.map(s => s.country))];
  const uniqueFields = [...new Set(scholarships.map(s => s.fieldOfStudy))];
  const uniqueTypes = [...new Set(scholarships.map(s => s.type))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate?.('home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="mb-4">All Scholarships</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Check out all the opportunities from around the world.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search scholarships, countries, or providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({scholarships.length})</TabsTrigger>
              <TabsTrigger value="ongoing">
                Ongoing ({scholarships.filter(s => s.status === "Ongoing").length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({scholarships.filter(s => s.status === "Upcoming").length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed ({scholarships.filter(s => s.status === "Closed").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country.toLowerCase()}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={fieldFilter} onValueChange={setFieldFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Field of Study" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {uniqueFields.map(field => (
                  <SelectItem key={field} value={field.toLowerCase()}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Scholarship Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={resetFilters}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="px-3 py-1">
                Search: "{searchQuery}"
                <button 
                  onClick={() => setSearchQuery("")}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {activeTab !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                Status: {activeTab}
                <button 
                  onClick={() => setActiveTab("all")}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {countryFilter !== "all" && (
              <Badge variant="secondary" className="px-3 py-1">
                Country: {countryFilter}
                <button 
                  onClick={() => setCountryFilter("all")}
                  className="ml-2 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </p>
        </div>

        {/* Scholarships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <Card
              key={scholarship.id}
              className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => onNavigate?.('scholarship-details')}
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={scholarship.image}
                  alt={scholarship.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge
                  className={`absolute top-4 left-4 ${getBadgeVariant(scholarship.status)}`}
                >
                  {scholarship.status}
                </Badge>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white/90">
                    {scholarship.level}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                  {scholarship.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{scholarship.country}</span>
                  <span>•</span>
                  <span>{scholarship.provider}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {scholarship.description}
                </p>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{scholarship.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{scholarship.students}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{scholarship.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Due: {scholarship.deadline}
                  </span>
                </div>

                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.('scholarship-details');
                  }}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredScholarships.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="mb-2">No scholarships found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more scholarships.
              </p>
              <Button onClick={resetFilters}>
                Clear all filters
              </Button>
            </div>
          </div>
        )}

        {/* Load More */}
        {filteredScholarships.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Scholarships
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}