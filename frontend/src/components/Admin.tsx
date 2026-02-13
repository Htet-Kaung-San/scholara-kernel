import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  BarChart3,
  Users,
  GraduationCap,
  FileText,
  TrendingUp,
  Settings,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Shield,
  Globe,
  Pencil,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate, useLocation } from "react-router";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Helpers ─────────────────────────────────

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":
    case "OPEN":
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "SUSPENDED":
    case "CLOSED":
    case "REJECTED":
      return "bg-red-100 text-red-800";
    case "UNDER_REVIEW":
    case "UPCOMING":
    case "DRAFT":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "No deadline";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No deadline";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const COUNTRY_OPTIONS = [
  "Australia",
  "Austria",
  "Belgium",
  "Brunei",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Hong Kong",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Italy",
  "Japan",
  "Malaysia",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Thailand",
  "United Kingdom",
  "United States",
  "Vietnam",
];

const FIELD_OF_STUDY_OPTIONS = [
  "Agriculture",
  "Architecture",
  "Artificial Intelligence",
  "Biology",
  "Biomedical Engineering",
  "Biotechnology",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Communication",
  "Computer Engineering",
  "Computer Science",
  "Data Science",
  "Dentistry",
  "Economics",
  "Education",
  "Electrical Engineering",
  "Environmental Science",
  "Finance",
  "Food Science",
  "International Relations",
  "Journalism",
  "Law",
  "Linguistics",
  "Marketing",
  "Mathematics",
  "Mechanical Engineering",
  "Medicine",
  "Nursing",
  "Pharmacy",
  "Physics",
  "Political Science",
  "Psychology",
  "Public Health",
  "Robotics",
  "Social Work",
  "Sociology",
  "Software Engineering",
  "Statistics",
];

function parseMultiValue(value?: string | null) {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
      .filter(Boolean)
    )
  );
}

function parseTuitionWaiver(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw || /^full$/i.test(raw)) {
    return { type: "FULL" as const, details: "" };
  }

  const partialMatch = raw.match(/^partial\s*[:\-]?\s*(.*)$/i);
  if (partialMatch) {
    return { type: "PARTIAL" as const, details: (partialMatch[1] ?? "").trim() };
  }

  return { type: "PARTIAL" as const, details: raw };
}

function parseImageUrls(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return Array.from(
        new Set(
          parsed
            .map((item) => String(item || "").trim())
            .filter(Boolean)
        )
      );
    }
  } catch {
    // Fallback to plain string parsing.
  }

  if (raw.includes(",")) {
    return Array.from(
      new Set(
        raw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

  return [raw];
}

function serializeImageUrls(urls: string[]) {
  const cleanUrls = Array.from(new Set(urls.map((url) => url.trim()).filter(Boolean)));
  if (cleanUrls.length === 0) return null;
  if (cleanUrls.length === 1) return cleanUrls[0];
  return JSON.stringify(cleanUrls);
}

function getPrimaryImageUrl(value?: string | null) {
  return parseImageUrls(value)[0] || "";
}

const SCHOLARSHIP_IMAGE_BUCKET =
  (import.meta.env.VITE_SUPABASE_STORAGE_BUCKET as string | undefined) ||
  "scholarship-images";
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// ─── Sidebar Nav Items ───────────────────────

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
  { key: "users", label: "Users", icon: Users, path: "/admin/users" },
  { key: "scholarships", label: "Scholarships", icon: GraduationCap, path: "/admin/scholarships" },
  { key: "applications", label: "Applications", icon: FileText, path: "/admin/applications" },
  { key: "analytics", label: "Analytics", icon: TrendingUp, path: "/admin/analytics" },
  { key: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
];

// ─── Main Admin Component ────────────────────

export function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  // Derive active section from URL
  const pathSegment = location.pathname.split("/")[2] || "dashboard";
  const activeSection = NAV_ITEMS.find((n) => n.key === pathSegment)
    ? pathSegment
    : "dashboard";

  // Redirect /admin → /admin/dashboard
  useEffect(() => {
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  // ─── Data State ────────────────────────────
  const [stats, setStats] = useState<any>(null);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingScholarships, setIsLoadingScholarships] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [error, setError] = useState("");
  const [isCreateScholarshipOpen, setIsCreateScholarshipOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<any>(null);
  const [createImageUrls, setCreateImageUrls] = useState<string[]>([]);
  const [createImageUrlInput, setCreateImageUrlInput] = useState("");
  const [createImageUploading, setCreateImageUploading] = useState(false);
  const [createTuitionWaiverType, setCreateTuitionWaiverType] =
    useState<"FULL" | "PARTIAL">("FULL");
  const [createTuitionWaiverDetails, setCreateTuitionWaiverDetails] = useState("");
  const [createHasMonthlyStipend, setCreateHasMonthlyStipend] =
    useState<"YES" | "NO">("NO");
  const [createMonthlyStipendText, setCreateMonthlyStipendText] = useState("");
  const [createHasApplicationFee, setCreateHasApplicationFee] =
    useState<"YES" | "NO">("NO");
  const [createApplicationFeeText, setCreateApplicationFeeText] = useState("");
  const [createHasFlightTicket, setCreateHasFlightTicket] =
    useState<"YES" | "NO">("NO");
  const [createFlightTicketText, setCreateFlightTicketText] = useState("");
  const [createSelectedCountries, setCreateSelectedCountries] = useState<string[]>([]);
  const [createCountrySelection, setCreateCountrySelection] = useState("");
  const [createSelectedFields, setCreateSelectedFields] = useState<string[]>([]);
  const [createFieldSelection, setCreateFieldSelection] = useState("");
  const [editHasMonthlyStipend, setEditHasMonthlyStipend] =
    useState<"YES" | "NO">("NO");
  const [editMonthlyStipendText, setEditMonthlyStipendText] = useState("");
  const [editHasApplicationFee, setEditHasApplicationFee] =
    useState<"YES" | "NO">("NO");
  const [editApplicationFeeText, setEditApplicationFeeText] = useState("");
  const [editHasFlightTicket, setEditHasFlightTicket] =
    useState<"YES" | "NO">("NO");
  const [editFlightTicketText, setEditFlightTicketText] = useState("");
  const [editSelectedCountries, setEditSelectedCountries] = useState<string[]>([]);
  const [editCountrySelection, setEditCountrySelection] = useState("");
  const [editSelectedFields, setEditSelectedFields] = useState<string[]>([]);
  const [editFieldSelection, setEditFieldSelection] = useState("");
  const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
  const [editImageUrlInput, setEditImageUrlInput] = useState("");
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editTuitionWaiverType, setEditTuitionWaiverType] =
    useState<"FULL" | "PARTIAL">("FULL");
  const [editTuitionWaiverDetails, setEditTuitionWaiverDetails] = useState("");
  const [scholarshipSearchTerm, setScholarshipSearchTerm] = useState("");
  const [scholarshipCountry, setScholarshipCountry] = useState("all");
  const [scholarshipType, setScholarshipType] = useState("all");
  const [scholarshipSortBy, setScholarshipSortBy] = useState("applicationDeadLine");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const resetCreateScholarshipFormState = () => {
    setCreateImageUrls([]);
    setCreateImageUrlInput("");
    setCreateImageUploading(false);
    setCreateTuitionWaiverType("FULL");
    setCreateTuitionWaiverDetails("");
    setCreateHasMonthlyStipend("NO");
    setCreateMonthlyStipendText("");
    setCreateHasApplicationFee("NO");
    setCreateApplicationFeeText("");
    setCreateHasFlightTicket("NO");
    setCreateFlightTicketText("");
    setCreateSelectedCountries([]);
    setCreateCountrySelection("");
    setCreateSelectedFields([]);
    setCreateFieldSelection("");
  };

  const addImageUrlManually = (mode: "create" | "edit") => {
    const inputValue = mode === "create" ? createImageUrlInput : editImageUrlInput;
    const url = inputValue.trim();
    if (!url) return;

    const isHttp = /^https?:\/\//i.test(url);
    if (!isHttp) {
      alert("Please enter a valid image URL starting with http:// or https://");
      return;
    }

    if (mode === "create") {
      setCreateImageUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
      setCreateImageUrlInput("");
    } else {
      setEditImageUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
      setEditImageUrlInput("");
    }
  };

  const removeImageUrl = (mode: "create" | "edit", urlToRemove: string) => {
    if (mode === "create") {
      setCreateImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
    } else {
      setEditImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
    }
  };

  const uploadScholarshipImages = async (
    files: File[],
    mode: "create" | "edit"
  ) => {
    if (files.length === 0) return;

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert("Please upload only image files.");
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        alert(`"${file.name}" is too large. Each image must be 5MB or less.`);
        return;
      }
    }

    if (mode === "create") {
      setCreateImageUploading(true);
    } else {
      setEditImageUploading(true);
    }

    try {
      const uploadTasks = files.map(async (file, index) => {
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `scholarships/${Date.now()}-${index}-${Math.random()
          .toString(36)
          .slice(2, 10)}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(SCHOLARSHIP_IMAGE_BUCKET)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from(SCHOLARSHIP_IMAGE_BUCKET)
          .getPublicUrl(filePath);

        return data.publicUrl;
      });

      const results = await Promise.allSettled(uploadTasks);
      const uploadedUrls = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
        .map((result) => result.value)
        .filter(Boolean);
      const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => String(result.reason?.message || result.reason || ""));

      if (uploadedUrls.length > 0) {
        if (mode === "create") {
          setCreateImageUrls((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
        } else {
          setEditImageUrls((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
        }
      }

      if (errors.length > 0) {
        const hasMissingBucketError = errors.some((message) =>
          message.toLowerCase().includes("bucket not found")
        );
        if (hasMissingBucketError) {
          alert(
            `Bucket "${SCHOLARSHIP_IMAGE_BUCKET}" not found. Create it in Supabase Storage or change VITE_SUPABASE_STORAGE_BUCKET.`
          );
          return;
        }

        const hasRlsError = errors.some((message) =>
          message.toLowerCase().includes("row-level security")
        );
        if (hasRlsError) {
          alert("Upload blocked by Supabase Storage RLS policy. Please update bucket policies.");
          return;
        }

        alert(`Some uploads failed. Uploaded ${uploadedUrls.length} of ${files.length} images.`);
      }
    } catch (err: any) {
      console.error("Failed to upload scholarship images:", err);
      const message = String(err?.message || "");
      if (message.toLowerCase().includes("bucket not found")) {
        alert(
          `Bucket "${SCHOLARSHIP_IMAGE_BUCKET}" not found. Create it in Supabase Storage or change VITE_SUPABASE_STORAGE_BUCKET.`
        );
        return;
      }
      alert(
        message ||
          "Image upload failed. Please check storage bucket policy or paste image URL manually."
      );
    } finally {
      if (mode === "create") {
        setCreateImageUploading(false);
      } else {
        setEditImageUploading(false);
      }
    }
  };


  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteScholarship = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scholarship?")) return;
    try {
      await api.delete(`/admin/scholarships/${id}`);
      await fetchScholarships();
    } catch {
      alert("Failed to delete scholarship");
    }
  };

  const handleReviewApplication = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await api.patch(`/admin/applications/${id}/review`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch {
      alert("Failed to update application");
    }
  };

  const fetchScholarships = async () => {
    setIsLoadingScholarships(true);
    try {
      const params: Record<string, string> = {
        limit: "100",
        sortBy: scholarshipSortBy,
        sortOrder: scholarshipSortBy === "createdAt" ? "desc" : "asc",
      };

      if (scholarshipSearchTerm.trim()) {
        params.search = scholarshipSearchTerm.trim();
      }
      if (scholarshipCountry !== "all") {
        params.country = scholarshipCountry;
      }
      if (scholarshipType !== "all") {
        params.type = scholarshipType;
      }

      const res = await api.get<any>("/scholarships", params);
      setScholarships(res.data || []);
    } catch (err) {
      console.error(err);
      setScholarships([]);
    } finally {
      setIsLoadingScholarships(false);
    }
  };

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<any>("/admin/dashboard");
        if (res.data) {
          setStats(res.data.stats);
          setRecentApplications(res.data.recentApplications || []);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch section data when section changes
  useEffect(() => {
    if (activeSection === "users") {
      setIsLoadingUsers(true);
      api
        .get<any>("/admin/users")
        .then((res) => { if (res.data) setUsers(res.data); })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingUsers(false));
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "scholarships") {
      fetchScholarships();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "applications") {
      setIsLoadingApplications(true);
      api
        .get<any>("/admin/applications")
        .then((res) => { if (res.data) setApplications(res.data); })
        .catch((err) => console.error(err))
        .finally(() => setIsLoadingApplications(false));
    }
  }, [activeSection]);

  useEffect(() => {
    if (!editingScholarship) {
      setEditImageUrls([]);
      setEditImageUrlInput("");
      setEditImageUploading(false);
      setEditTuitionWaiverType("FULL");
      setEditTuitionWaiverDetails("");
      setEditHasMonthlyStipend("NO");
      setEditMonthlyStipendText("");
      setEditHasApplicationFee("NO");
      setEditApplicationFeeText("");
      setEditHasFlightTicket("NO");
      setEditFlightTicketText("");
      setEditSelectedCountries([]);
      setEditCountrySelection("");
      setEditSelectedFields([]);
      setEditFieldSelection("");
      return;
    }

    setEditImageUrls(parseImageUrls(editingScholarship.imageUrl));
    setEditImageUrlInput("");
    setEditImageUploading(false);

    const tuitionWaiver = parseTuitionWaiver(editingScholarship.tuitionWaiver);
    setEditTuitionWaiverType(tuitionWaiver.type);
    setEditTuitionWaiverDetails(tuitionWaiver.details);

    if (editingScholarship.monthlyStipend) {
      setEditHasMonthlyStipend("YES");
      setEditMonthlyStipendText(String(editingScholarship.monthlyStipend));
    } else {
      setEditHasMonthlyStipend("NO");
      setEditMonthlyStipendText("");
    }

    if (editingScholarship.applicationFee) {
      setEditHasApplicationFee("YES");
      setEditApplicationFeeText(String(editingScholarship.applicationFee));
    } else {
      setEditHasApplicationFee("NO");
      setEditApplicationFeeText("");
    }

    if (editingScholarship.flightTicket) {
      setEditHasFlightTicket("YES");
      setEditFlightTicketText(String(editingScholarship.flightTicket));
    } else {
      setEditHasFlightTicket("NO");
      setEditFlightTicketText("");
    }

    const countries = parseMultiValue(editingScholarship.country);
    setEditSelectedCountries(countries);
    setEditCountrySelection(
      COUNTRY_OPTIONS.find((country) => !countries.includes(country)) || ""
    );

    const fields = parseMultiValue(editingScholarship.fieldOfStudy);
    setEditSelectedFields(fields);
    setEditFieldSelection(
      FIELD_OF_STUDY_OPTIONS.find((field) => !fields.includes(field)) || ""
    );
  }, [editingScholarship]);

  // ─── Render ────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside
        className={`${isSidebarCollapsed ? "w-20" : "w-64"} bg-white text-black flex flex-col fixed top-0 left-0 h-screen z-40 border-r border-gray-200 transition-all duration-200`}
      >
        {/* Brand */}
        <div className={`${isSidebarCollapsed ? "px-3" : "px-6"} relative py-5 border-b border-gray-200`}>
          <div className={`flex items-center ${isSidebarCollapsed ? "justify-center" : "justify-between"} gap-3`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="text-base font-semibold tracking-tight text-black">ScholarAid</h1>
                  <p className="text-[11px] text-gray-400 font-medium">Admin Panel</p>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:text-black hover:bg-gray-50"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="absolute top-4 right-2 rounded-md border border-gray-200 bg-white p-1.5 text-gray-500 hover:text-black hover:bg-gray-50"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150 ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"} ${isActive
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
                  }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-black" : ""}`} />
                {!isSidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          <button
            onClick={() => navigate("/")}
            title="View Site"
            className={`w-full flex items-center rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            <Globe className="h-[18px] w-[18px]" />
            {!isSidebarCollapsed && "View Site"}
          </button>
          <button
            onClick={handleSignOut}
            title="Log Out"
            className={`w-full flex items-center rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all ${isSidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}
          >
            <LogOut className="h-[18px] w-[18px]" />
            {!isSidebarCollapsed && "Log Out"}
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={`flex-1 transition-all duration-200 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {activeSection}
            </h2>
            <p className="text-sm text-gray-500">
              {activeSection === "dashboard" && "Overview of platform activity"}
              {activeSection === "users" && "Manage platform users and permissions"}
              {activeSection === "scholarships" && "Create and manage scholarship opportunities"}
              {activeSection === "applications" && "Review and manage scholarship applications"}
              {activeSection === "analytics" && "Platform performance and user insights"}
              {activeSection === "settings" && "Configure platform behavior and preferences"}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Super Admin
          </Badge>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* ── DASHBOARD ────────────── */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center p-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-red-500 bg-red-50 rounded-md">
                  Error loading dashboard: {error}
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-green-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Active
                          </span>
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scholarships</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalScholarships || 0}</div>
                        <p className="text-xs text-muted-foreground">Total opportunities</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Applications</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                        <p className="text-xs text-muted-foreground">Across all scholarships</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats?.applicationsByStatus?.UNDER_REVIEW || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <span className="text-yellow-600 flex items-center gap-1">
                            Needs attention
                          </span>
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>Latest scholarship applications submitted</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {recentApplications.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No applications yet.</p>
                          ) : (
                            recentApplications.map((app: any) => (
                              <div key={app.id} className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {app.user?.firstName} {app.user?.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {app.scholarship?.title}
                                  </p>
                                </div>
                                <Badge className={getStatusBadge(app.status)}>
                                  {app.status}
                                </Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>System Status</CardTitle>
                        <CardDescription>Platform health and performance metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Server Status</span>
                            <Badge className="bg-green-100 text-green-800">Online</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Database</span>
                            <Badge className="bg-green-100 text-green-800">Connected</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Service</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── USERS ────────────────── */}
          {activeSection === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Applications</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(user.status)}>
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{user._count?.applications || 0}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── SCHOLARSHIPS ─────────── */}
          {activeSection === "scholarships" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <Dialog
                  open={isCreateScholarshipOpen}
                  onOpenChange={(open) => {
                    setIsCreateScholarshipOpen(open);
                    if (!open) {
                      resetCreateScholarshipFormState();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Scholarship
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Scholarship</DialogTitle>
                      <DialogDescription>
                        Add a new scholarship opportunity
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const fd = new FormData(form);
                        const description =
                          ((fd.get("description") as string | null) ?? "").trim();
                        if (createSelectedCountries.length === 0) {
                          alert("Please select at least one country.");
                          return;
                        }
                        if (createSelectedFields.length === 0) {
                          alert("Please select at least one field of study.");
                          return;
                        }
                        if (
                          createTuitionWaiverType === "PARTIAL" &&
                          !createTuitionWaiverDetails.trim()
                        ) {
                          alert("Please add tuition waiver details for Partial option.");
                          return;
                        }
                        const monthlyStipend =
                          createHasMonthlyStipend === "YES"
                            ? createMonthlyStipendText.trim()
                            : "";
                        const tuitionWaiver =
                          createTuitionWaiverType === "FULL"
                            ? "Full"
                            : `Partial: ${createTuitionWaiverDetails.trim()}`;
                        const applicationFee =
                          createHasApplicationFee === "YES"
                            ? createApplicationFeeText.trim()
                            : "";
                        const flightTicket =
                          createHasFlightTicket === "YES"
                            ? createFlightTicketText.trim()
                            : "";
                        const data: any = {
                          title: fd.get("title") as string,
                          provider: fd.get("provider") as string,
                          country: createSelectedCountries.join(", "),
                          imageUrl: serializeImageUrls(createImageUrls),
                          description: description || undefined,
                          level: (fd.get("level") as string) || "undergraduate",
                          fieldOfStudy: createSelectedFields.join(", "),
                          type: (fd.get("type") as string) || "GOVERNMENT",
                          status: (fd.get("status") as string) || "DRAFT",
                          tuitionWaiver,
                          monthlyStipend: monthlyStipend || null,
                          applicationFee: applicationFee || null,
                          flightTicket: flightTicket || null,
                          maxAge: Number(fd.get("maxAge")) || null,
                          featured: false,
                        };
                        const openDate = fd.get("openDate") as string;
                        if (openDate) data.openDate = new Date(openDate).toISOString();

                        const appDeadline = fd.get("applicationDeadLine") as string;
                        if (appDeadline) data.applicationDeadLine = new Date(appDeadline).toISOString();

                        const duration = fd.get("duration") as string;
                        if (duration) data.duration = duration;

                        try {
                          const res = await api.post<any>("/admin/scholarships", data);
                          if (res.data) await fetchScholarships();
                          setIsCreateScholarshipOpen(false);
                          resetCreateScholarshipFormState();
                          form.reset();
                        } catch (err: any) {
                          alert(
                            "Failed to create: " +
                            (err?.response?.data?.error || err.message)
                          );
                        }
                      }}
                      className="space-y-4 max-h-[60vh] overflow-y-auto pr-1"
                    >
                      <div>
                        <Label htmlFor="title">Scholarship Title *</Label>
                        <Input id="title" name="title" placeholder="Global Korea Scholarship" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="provider">Provider *</Label>
                          <Input id="provider" name="provider" placeholder="Korean Government" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-image-upload">Scholarship Photo</Label>
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <Input
                            id="create-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                void uploadScholarshipImages(files, "create");
                              }
                              e.target.value = "";
                            }}
                            disabled={createImageUploading}
                          />
                        </div>
                        <div className="flex flex-col gap-2 md:flex-row">
                          <Input
                            value={createImageUrlInput}
                            onChange={(e) => setCreateImageUrlInput(e.target.value)}
                            placeholder="Or paste image URL"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addImageUrlManually("create")}
                            disabled={!createImageUrlInput.trim() || createImageUploading}
                          >
                            Add URL
                          </Button>
                        </div>
                        {createImageUrls.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            {createImageUrls.map((url) => (
                              <div
                                key={url}
                                className="relative h-28 overflow-hidden rounded-md border border-border"
                              >
                                <ImageWithFallback
                                  src={url}
                                  alt="Scholarship preview"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImageUrl("create", url)}
                                  className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            You can upload one or multiple photos.
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {createImageUploading
                            ? "Uploading image(s)..."
                            : "Accepted: JPG, PNG, WEBP up to 5MB."}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Write scholarship details, eligibility overview, and key notes..."
                        />
                      </div>

                      {/* Financial Support Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tuitionWaiverOption">Tuition Waiver</Label>
                          <select
                            id="tuitionWaiverOption"
                            value={createTuitionWaiverType}
                            onChange={(e) => {
                              const value = e.target.value as "FULL" | "PARTIAL";
                              setCreateTuitionWaiverType(value);
                              if (value === "FULL") {
                                setCreateTuitionWaiverDetails("");
                              }
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="FULL">Full</option>
                            <option value="PARTIAL">Partial</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          {createTuitionWaiverType === "PARTIAL" && (
                            <>
                              <Label htmlFor="tuitionWaiverDetails">More Details</Label>
                              <Input
                                id="tuitionWaiverDetails"
                                value={createTuitionWaiverDetails}
                                onChange={(e) => setCreateTuitionWaiverDetails(e.target.value)}
                                placeholder="e.g. 50% tuition covered"
                                required
                              />
                            </>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="monthlyStipendOption">Monthly Stipend</Label>
                          <select
                            id="monthlyStipendOption"
                            value={createHasMonthlyStipend}
                            onChange={(e) => {
                              const value = e.target.value as "YES" | "NO";
                              setCreateHasMonthlyStipend(value);
                              if (value === "NO") setCreateMonthlyStipendText("");
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="NO">No</option>
                            <option value="YES">Yes</option>
                          </select>
                        </div>
                      </div>
                      {createHasMonthlyStipend === "YES" && (
                        <div>
                          <Label htmlFor="monthlyStipendValue">Monthly Stipend Details</Label>
                          <Input
                            id="monthlyStipendValue"
                            value={createMonthlyStipendText}
                            onChange={(e) => setCreateMonthlyStipendText(e.target.value)}
                            placeholder="Approximately 1,100,000 KRW"
                            required
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="applicationFeeOption">Application Fee</Label>
                          <select
                            id="applicationFeeOption"
                            value={createHasApplicationFee}
                            onChange={(e) => {
                              const value = e.target.value as "YES" | "NO";
                              setCreateHasApplicationFee(value);
                              if (value === "NO") setCreateApplicationFeeText("");
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="NO">No</option>
                            <option value="YES">Yes</option>
                          </select>
                          {createHasApplicationFee === "YES" && (
                            <Input
                              id="applicationFeeValue"
                              value={createApplicationFeeText}
                              onChange={(e) => setCreateApplicationFeeText(e.target.value)}
                              placeholder="Approximately $50 or Waived"
                              required
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="flightTicketOption">Flight Ticket</Label>
                          <select
                            id="flightTicketOption"
                            value={createHasFlightTicket}
                            onChange={(e) => {
                              const value = e.target.value as "YES" | "NO";
                              setCreateHasFlightTicket(value);
                              if (value === "NO") setCreateFlightTicketText("");
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="NO">No</option>
                            <option value="YES">Yes</option>
                          </select>
                          {createHasFlightTicket === "YES" && (
                            <Input
                              id="flightTicketValue"
                              value={createFlightTicketText}
                              onChange={(e) => setCreateFlightTicketText(e.target.value)}
                              placeholder="Round trip covered by sponsor"
                              required
                            />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="countrySelect">Country *</Label>
                          <div className="flex gap-2">
                            <select
                              id="countrySelect"
                              value={createCountrySelection}
                              onChange={(e) => setCreateCountrySelection(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Choose a country</option>
                              {COUNTRY_OPTIONS.filter(
                                (country) => !createSelectedCountries.includes(country)
                              ).map((country) => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (!createCountrySelection) return;
                                setCreateSelectedCountries((prev) =>
                                  prev.includes(createCountrySelection)
                                    ? prev
                                    : [...prev, createCountrySelection]
                                );
                                setCreateCountrySelection("");
                              }}
                              disabled={!createCountrySelection}
                            >
                              Select more
                            </Button>
                          </div>
                          {createSelectedCountries.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {createSelectedCountries.map((country) => (
                                <span
                                  key={country}
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs"
                                >
                                  {country}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCreateSelectedCountries((prev) =>
                                        prev.filter((item) => item !== country)
                                      )
                                    }
                                    className="text-gray-500 hover:text-black"
                                  >
                                    x
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Select at least one country.
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fieldOfStudySelect">Field of Study *</Label>
                          <div className="flex gap-2">
                            <select
                              id="fieldOfStudySelect"
                              value={createFieldSelection}
                              onChange={(e) => setCreateFieldSelection(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="">Choose a major</option>
                              {FIELD_OF_STUDY_OPTIONS.filter(
                                (field) => !createSelectedFields.includes(field)
                              ).map((field) => (
                                <option key={field} value={field}>
                                  {field}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                if (!createFieldSelection) return;
                                setCreateSelectedFields((prev) =>
                                  prev.includes(createFieldSelection)
                                    ? prev
                                    : [...prev, createFieldSelection]
                                );
                                setCreateFieldSelection("");
                              }}
                              disabled={!createFieldSelection}
                            >
                              Select more
                            </Button>
                          </div>
                          {createSelectedFields.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {createSelectedFields.map((field) => (
                                <span
                                  key={field}
                                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs"
                                >
                                  {field}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCreateSelectedFields((prev) =>
                                        prev.filter((item) => item !== field)
                                      )
                                    }
                                    className="text-gray-500 hover:text-black"
                                  >
                                    x
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Select at least one major.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="maxAge">Max Age</Label>
                          <Input id="maxAge" name="maxAge" type="number" placeholder="e.g. 30" />
                        </div>
                        <div>
                          <Label htmlFor="openDate">Application Opening Date</Label>
                          <DatePicker id="openDate" name="openDate" placeholder="dd/mm/yy" />
                        </div>
                        <div>
                          <Label htmlFor="applicationDeadLine">Application Closing Date</Label>
                          <DatePicker id="applicationDeadLine" name="applicationDeadLine" placeholder="dd/mm/yy" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Duration kept */}
                        <div>
                          <Label htmlFor="duration">Duration</Label>
                          <Input id="duration" name="duration" placeholder="2 years" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="level">Level *</Label>
                          <select
                            id="level"
                            name="level"
                            defaultValue="undergraduate"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="undergraduate">Undergraduate</option>
                            <option value="graduate">Graduate</option>
                            <option value="masters">Master's</option>
                            <option value="phd">PhD</option>
                            <option value="both">Both</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <select
                            id="type"
                            name="type"
                            defaultValue="GOVERNMENT"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="GOVERNMENT">Government</option>
                            <option value="UNIVERSITY">University</option>
                            <option value="PRIVATE">Private</option>
                            <option value="NGO">NGO</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            name="status"
                            defaultValue="OPEN"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="OPEN">Open</option>
                            <option value="UPCOMING">Upcoming</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateScholarshipOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create Scholarship</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* EDIT SCHOLARSHIP DIALOG */}
                <Dialog
                  open={!!editingScholarship}
                  onOpenChange={(open) => !open && setEditingScholarship(null)}
                >
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Scholarship</DialogTitle>
                      <DialogDescription>
                        Update scholarship details
                      </DialogDescription>
                    </DialogHeader>
                    {editingScholarship && (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const fd = new FormData(form);
                          const description =
                            ((fd.get("description") as string | null) ?? "").trim();
                          if (editSelectedCountries.length === 0) {
                            alert("Please select at least one country.");
                            return;
                          }
                          if (editSelectedFields.length === 0) {
                            alert("Please select at least one field of study.");
                            return;
                          }
                          if (
                            editTuitionWaiverType === "PARTIAL" &&
                            !editTuitionWaiverDetails.trim()
                          ) {
                            alert("Please add tuition waiver details for Partial option.");
                            return;
                          }
                          const monthlyStipend =
                            editHasMonthlyStipend === "YES"
                              ? editMonthlyStipendText.trim()
                              : "";
                          const tuitionWaiver =
                            editTuitionWaiverType === "FULL"
                              ? "Full"
                              : `Partial: ${editTuitionWaiverDetails.trim()}`;
                          const applicationFee =
                            editHasApplicationFee === "YES"
                              ? editApplicationFeeText.trim()
                              : "";
                          const flightTicket =
                            editHasFlightTicket === "YES"
                              ? editFlightTicketText.trim()
                              : "";
                          const data: any = {
                            title: fd.get("title") as string,
                            provider: fd.get("provider") as string,
                            country: editSelectedCountries.join(", "),
                            imageUrl: serializeImageUrls(editImageUrls),
                            description: description || undefined,
                            level: (fd.get("level") as string),
                            fieldOfStudy: editSelectedFields.join(", "),
                            type: (fd.get("type") as string),
                            status: (fd.get("status") as string),
                            tuitionWaiver,
                            monthlyStipend: monthlyStipend || null,
                            applicationFee: applicationFee || null,
                            flightTicket: flightTicket || null,
                            maxAge: Number(fd.get("maxAge")) || null,
                          };
                          const openDate = fd.get("openDate") as string;
                          if (openDate) data.openDate = new Date(openDate).toISOString();

                          const appDeadline = fd.get("applicationDeadLine") as string;
                          if (appDeadline) data.applicationDeadLine = new Date(appDeadline).toISOString();

                          const duration = fd.get("duration") as string;
                          if (duration) data.duration = duration;

                          try {
                            const res = await api.patch<any>(`/admin/scholarships/${editingScholarship.id}`, data);
                            if (res.data) {
                              await fetchScholarships();
                            }
                            setEditingScholarship(null);
                          } catch (err: any) {
                            alert(
                              "Failed to update: " +
                              (err?.response?.data?.error || err.message)
                            );
                          }
                        }}
                        className="space-y-4 max-h-[60vh] overflow-y-auto pr-1"
                      >
                        <div>
                          <Label htmlFor="edit-title">Scholarship Title *</Label>
                          <Input
                            id="edit-title"
                            name="title"
                            defaultValue={editingScholarship.title}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-provider">Provider *</Label>
                            <Input
                              id="edit-provider"
                              name="provider"
                              defaultValue={editingScholarship.provider}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-image-upload">Scholarship Photo</Label>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <Input
                              id="edit-image-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                  void uploadScholarshipImages(files, "edit");
                                }
                                e.target.value = "";
                              }}
                              disabled={editImageUploading}
                            />
                          </div>
                          <div className="flex flex-col gap-2 md:flex-row">
                            <Input
                              value={editImageUrlInput}
                              onChange={(e) => setEditImageUrlInput(e.target.value)}
                              placeholder="Or paste image URL"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addImageUrlManually("edit")}
                              disabled={!editImageUrlInput.trim() || editImageUploading}
                            >
                              Add URL
                            </Button>
                          </div>
                          {editImageUrls.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                              {editImageUrls.map((url) => (
                                <div
                                  key={url}
                                  className="relative h-28 overflow-hidden rounded-md border border-border"
                                >
                                  <ImageWithFallback
                                    src={url}
                                    alt="Scholarship preview"
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImageUrl("edit", url)}
                                    className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs text-white"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              You can upload one or multiple photos.
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {editImageUploading
                              ? "Uploading image(s)..."
                              : "Accepted: JPG, PNG, WEBP up to 5MB."}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            name="description"
                            defaultValue={editingScholarship.description || ""}
                            placeholder="Write scholarship details, eligibility overview, and key notes..."
                          />
                        </div>

                        {/* Financial Support Section */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-tuitionWaiverOption">Tuition Waiver</Label>
                            <select
                              id="edit-tuitionWaiverOption"
                              value={editTuitionWaiverType}
                              onChange={(e) => {
                                const value = e.target.value as "FULL" | "PARTIAL";
                                setEditTuitionWaiverType(value);
                                if (value === "FULL") {
                                  setEditTuitionWaiverDetails("");
                                }
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="FULL">Full</option>
                              <option value="PARTIAL">Partial</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            {editTuitionWaiverType === "PARTIAL" && (
                              <>
                                <Label htmlFor="edit-tuitionWaiverDetails">More Details</Label>
                                <Input
                                  id="edit-tuitionWaiverDetails"
                                  value={editTuitionWaiverDetails}
                                  onChange={(e) => setEditTuitionWaiverDetails(e.target.value)}
                                  placeholder="e.g. 50% tuition covered"
                                  required
                                />
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-monthlyStipendOption">Monthly Stipend</Label>
                            <select
                              id="edit-monthlyStipendOption"
                              value={editHasMonthlyStipend}
                              onChange={(e) => {
                                const value = e.target.value as "YES" | "NO";
                                setEditHasMonthlyStipend(value);
                                if (value === "NO") setEditMonthlyStipendText("");
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="NO">No</option>
                              <option value="YES">Yes</option>
                            </select>
                          </div>
                        </div>
                        {editHasMonthlyStipend === "YES" && (
                          <div>
                            <Label htmlFor="edit-monthlyStipendValue">Monthly Stipend Details</Label>
                            <Input
                              id="edit-monthlyStipendValue"
                              value={editMonthlyStipendText}
                              onChange={(e) => setEditMonthlyStipendText(e.target.value)}
                              placeholder="Approximately 1,100,000 KRW"
                              required
                            />
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-applicationFeeOption">Application Fee</Label>
                            <select
                              id="edit-applicationFeeOption"
                              value={editHasApplicationFee}
                              onChange={(e) => {
                                const value = e.target.value as "YES" | "NO";
                                setEditHasApplicationFee(value);
                                if (value === "NO") setEditApplicationFeeText("");
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="NO">No</option>
                              <option value="YES">Yes</option>
                            </select>
                            {editHasApplicationFee === "YES" && (
                              <Input
                                id="edit-applicationFeeValue"
                                value={editApplicationFeeText}
                                onChange={(e) => setEditApplicationFeeText(e.target.value)}
                                placeholder="Approximately $50 or Waived"
                                required
                              />
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-flightTicketOption">Flight Ticket</Label>
                            <select
                              id="edit-flightTicketOption"
                              value={editHasFlightTicket}
                              onChange={(e) => {
                                const value = e.target.value as "YES" | "NO";
                                setEditHasFlightTicket(value);
                                if (value === "NO") setEditFlightTicketText("");
                              }}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="NO">No</option>
                              <option value="YES">Yes</option>
                            </select>
                            {editHasFlightTicket === "YES" && (
                              <Input
                                id="edit-flightTicketValue"
                                value={editFlightTicketText}
                                onChange={(e) => setEditFlightTicketText(e.target.value)}
                                placeholder="Round trip covered by sponsor"
                                required
                              />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-countrySelect">Country *</Label>
                            <div className="flex gap-2">
                              <select
                                id="edit-countrySelect"
                                value={editCountrySelection}
                                onChange={(e) => setEditCountrySelection(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Choose a country</option>
                                {COUNTRY_OPTIONS.filter(
                                  (country) => !editSelectedCountries.includes(country)
                                ).map((country) => (
                                  <option key={country} value={country}>
                                    {country}
                                  </option>
                                ))}
                              </select>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (!editCountrySelection) return;
                                  setEditSelectedCountries((prev) =>
                                    prev.includes(editCountrySelection)
                                      ? prev
                                      : [...prev, editCountrySelection]
                                  );
                                  setEditCountrySelection("");
                                }}
                                disabled={!editCountrySelection}
                              >
                                Select more
                              </Button>
                            </div>
                            {editSelectedCountries.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {editSelectedCountries.map((country) => (
                                  <span
                                    key={country}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs"
                                  >
                                    {country}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditSelectedCountries((prev) =>
                                          prev.filter((item) => item !== country)
                                        )
                                      }
                                      className="text-gray-500 hover:text-black"
                                    >
                                      x
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Select at least one country.
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-fieldOfStudySelect">Field of Study *</Label>
                            <div className="flex gap-2">
                              <select
                                id="edit-fieldOfStudySelect"
                                value={editFieldSelection}
                                onChange={(e) => setEditFieldSelection(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              >
                                <option value="">Choose a major</option>
                                {FIELD_OF_STUDY_OPTIONS.filter(
                                  (field) => !editSelectedFields.includes(field)
                                ).map((field) => (
                                  <option key={field} value={field}>
                                    {field}
                                  </option>
                                ))}
                              </select>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  if (!editFieldSelection) return;
                                  setEditSelectedFields((prev) =>
                                    prev.includes(editFieldSelection)
                                      ? prev
                                      : [...prev, editFieldSelection]
                                  );
                                  setEditFieldSelection("");
                                }}
                                disabled={!editFieldSelection}
                              >
                                Select more
                              </Button>
                            </div>
                            {editSelectedFields.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {editSelectedFields.map((field) => (
                                  <span
                                    key={field}
                                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs"
                                  >
                                    {field}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditSelectedFields((prev) =>
                                          prev.filter((item) => item !== field)
                                        )
                                      }
                                      className="text-gray-500 hover:text-black"
                                    >
                                      x
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Select at least one major.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-maxAge">Max Age</Label>
                            <Input id="edit-maxAge" name="maxAge" type="number" defaultValue={editingScholarship.maxAge} />
                          </div>
                          <div>
                            <Label htmlFor="edit-openDate">Opening Date</Label>
                            <DatePicker
                              id="edit-openDate"
                              name="openDate"
                              defaultValue={editingScholarship.openDate}
                              placeholder="dd/mm/yy"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-applicationDeadLine">Closing Date</Label>
                            <DatePicker
                              id="edit-applicationDeadLine"
                              name="applicationDeadLine"
                              defaultValue={editingScholarship.applicationDeadLine}
                              placeholder="dd/mm/yy"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Duration kept */}
                          <div>
                            <Label htmlFor="edit-duration">Duration</Label>
                            <Input
                              id="edit-duration"
                              name="duration"
                              defaultValue={editingScholarship.duration}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-level">Level *</Label>
                            <select
                              id="edit-level"
                              name="level"
                              defaultValue={editingScholarship.level}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="undergraduate">Undergraduate</option>
                              <option value="graduate">Graduate</option>
                              <option value="masters">Master's</option>
                              <option value="phd">PhD</option>
                              <option value="both">Both</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="edit-type">Type *</Label>
                            <select
                              id="edit-type"
                              name="type"
                              defaultValue={editingScholarship.type}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="GOVERNMENT">Government</option>
                              <option value="UNIVERSITY">University</option>
                              <option value="PRIVATE">Private</option>
                              <option value="NGO">NGO</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="edit-status">Status *</Label>
                            <select
                              id="edit-status"
                              name="status"
                              defaultValue={editingScholarship.status}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="OPEN">Open</option>
                              <option value="CLOSED">Closed</option>
                              <option value="UPCOMING">Upcoming</option>
                              <option value="DRAFT">Draft</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditingScholarship(null)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>

              </div>

              <div className="flex flex-col xl:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scholarships..."
                    value={scholarshipSearchTerm}
                    onChange={(e) => setScholarshipSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchScholarships();
                    }}
                    className="pl-10"
                  />
                </div>

                <select
                  value={scholarshipCountry}
                  onChange={(e) => setScholarshipCountry(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[180px]"
                >
                  <option value="all">All Countries</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Japan">Japan</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                </select>

                <select
                  value={scholarshipType}
                  onChange={(e) => setScholarshipType(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[180px]"
                >
                  <option value="all">All Types</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="PRIVATE">Private</option>
                  <option value="NGO">NGO</option>
                </select>

                <select
                  value={scholarshipSortBy}
                  onChange={(e) => setScholarshipSortBy(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[180px]"
                >
                  <option value="applicationDeadLine">Closing Date</option>
                  <option value="deadline">Legacy Deadline</option>
                  <option value="createdAt">Newest</option>
                  <option value="title">Title</option>
                </select>

                <Button onClick={fetchScholarships} className="xl:min-w-[120px]">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>

              {isLoadingScholarships ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scholarship</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Closing Date</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead className="w-40 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(6)].map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7}>
                              <div className="h-10 animate-pulse rounded bg-muted" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : scholarships.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No scholarships found</h3>
                    <p className="text-muted-foreground">
                      Click "Add Scholarship" to create one.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scholarship</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Featured</TableHead>
                          <TableHead>Closing Date</TableHead>
                          <TableHead>Applicants</TableHead>
                          <TableHead className="w-40 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scholarships.map((s: any) => (
                          <TableRow
                            key={s.id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => navigate(`/scholarships/${s.id}`)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3 min-w-0">
                                {getPrimaryImageUrl(s.imageUrl) ? (
                                  <div className="h-12 w-12 overflow-hidden rounded-md border border-border shrink-0">
                                    <ImageWithFallback
                                      src={getPrimaryImageUrl(s.imageUrl)}
                                      alt={s.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-12 w-12 rounded-md border border-dashed border-border bg-muted/40 shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{s.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{s.provider}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <p className="truncate text-sm text-muted-foreground">
                                {s.country || "Country not specified"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(s.status)}>{s.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {s.featured ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  Featured
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(s.applicationDeadLine ?? s.deadline)}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {s._count?.applications || 0}
                            </TableCell>
                            <TableCell className="text-right">
                              <div
                                className="flex justify-end gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingScholarship(s)}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteScholarship(s.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── APPLICATIONS ─────────── */}
          {activeSection === "applications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Scholarship</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingApplications ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading applications...
                          </TableCell>
                        </TableRow>
                      ) : applications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No applications found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        applications.map((app: any) => (
                          <TableRow key={app.id}>
                            <TableCell>
                              <p className="font-medium">
                                {app.user?.firstName} {app.user?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {app.user?.email}
                              </p>
                            </TableCell>
                            <TableCell>{app.scholarship?.title}</TableCell>
                            <TableCell>
                              <Badge className={getStatusBadge(app.status)}>
                                {app.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(app.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {app.score !== null && app.score !== undefined ? (
                                  <>
                                    <div className="w-12 h-2 bg-gray-200 rounded-full">
                                      <div
                                        className="h-2 bg-blue-600 rounded-full"
                                        style={{ width: `${app.score}%` }}
                                      />
                                    </div>
                                    <span className="text-sm">{app.score}</span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() =>
                                    handleReviewApplication(app.id, "APPROVED")
                                  }
                                  disabled={app.status === "APPROVED"}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    handleReviewApplication(app.id, "REJECTED")
                                  }
                                  disabled={app.status === "REJECTED"}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── ANALYTICS ────────────── */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div />
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Monthly user registration trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center bg-muted/30 rounded">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZG1pbiUyMGRhc2hib2FyZCUyMGFuYWx5dGljcyUyMGNoYXJ0c3xlbnwxfHx8fDE3NTg4MjIzNDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Analytics Chart"
                        className="w-full h-full object-cover rounded opacity-50"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application Success Rate</CardTitle>
                    <CardDescription>Approval vs rejection statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Approved</span>
                        <span className="text-green-600 font-medium">68%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Under Review</span>
                        <span className="text-yellow-600 font-medium">22%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Rejected</span>
                        <span className="text-red-600 font-medium">10%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Popular Scholarships</CardTitle>
                    <CardDescription>Most applied scholarships this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Global Korea</span>
                        <span className="font-medium">245</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">DAAD German</span>
                        <span className="font-medium">189</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Chevening UK</span>
                        <span className="font-medium">156</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ── SETTINGS ─────────────── */}
          {activeSection === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Basic platform configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Put platform in maintenance mode
                      </p>
                    </div>
                    <Switch id="maintenance" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrations">Allow New Registrations</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable user account creation
                      </p>
                    </div>
                    <Switch id="registrations" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send system notifications via email
                      </p>
                    </div>
                    <Switch id="notifications" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Platform security configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="2fa">Require 2FA for Admins</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce two-factor authentication
                      </p>
                    </div>
                    <Switch id="2fa" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sessions">Force Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out inactive users
                      </p>
                    </div>
                    <Switch id="sessions" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="logs">Enable Audit Logs</Label>
                      <p className="text-sm text-muted-foreground">
                        Track all admin actions
                      </p>
                    </div>
                    <Switch id="logs" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure system notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@scholara.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-server">SMTP Server</Label>
                    <Input id="smtp-server" placeholder="smtp.gmail.com" />
                  </div>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email Configuration
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Platform status and version information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Platform Version</span>
                    <span className="text-sm font-medium">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Database Status</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Storage Used</span>
                    <span className="text-sm font-medium">2.4 GB / 50 GB</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
