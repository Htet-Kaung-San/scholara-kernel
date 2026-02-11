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
  MapPin,
  DollarSign,
  Mail,
  LogOut,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate, useLocation } from "react-router";
import { api } from "@/lib/api";
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
  const [scholarshipSearchTerm, setScholarshipSearchTerm] = useState("");
  const [scholarshipCountry, setScholarshipCountry] = useState("all");
  const [scholarshipType, setScholarshipType] = useState("all");
  const [scholarshipSortBy, setScholarshipSortBy] = useState("applicationDeadLine");


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

  // ─── Render ────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#fafbfc]">
      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-64 bg-white text-black flex flex-col fixed top-0 left-0 h-screen z-40 border-r border-gray-200">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-black">ScholarAid</h1>
              <p className="text-[11px] text-gray-400 font-medium">Admin Panel</p>
            </div>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                  ? "bg-gray-100 text-black"
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
                  }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-black" : ""}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-1">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-all"
          >
            <Globe className="h-[18px] w-[18px]" />
            View Site
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Log Out
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 ml-64">
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
                  onOpenChange={setIsCreateScholarshipOpen}
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
                        const data: any = {
                          title: fd.get("title") as string,
                          provider: fd.get("provider") as string,
                          country: fd.get("country") as string,
                          // description: fd.get("description") as string, // Removed
                          // value: fd.get("value") as string, // Removed
                          level: (fd.get("level") as string) || "undergraduate",
                          fieldOfStudy: fd.get("fieldOfStudy") as string,
                          type: (fd.get("type") as string) || "GOVERNMENT",
                          status: (fd.get("status") as string) || "DRAFT",
                          tuitionWaiver: fd.get("tuitionWaiver") as string,
                          monthlyStipend: fd.get("monthlyStipend") as string,
                          applicationFee: fd.get("applicationFee") as string,
                          flightTicket: fd.get("flightTicket") as string,
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
                      {/* Removed Value and Description Inputs */}

                      {/* Financial Support Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tuitionWaiver">Tuition Waiver</Label>
                          <Input id="tuitionWaiver" name="tuitionWaiver" placeholder="e.g. 100%, 50%..." />
                        </div>
                        <div>
                          <Label htmlFor="monthlyStipend">Monthly Stipend</Label>
                          <Input id="monthlyStipend" name="monthlyStipend" placeholder="e.g. $1000" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="applicationFee">Application Fee</Label>
                          <Input id="applicationFee" name="applicationFee" placeholder="e.g. $50 or Waived" />
                        </div>
                        <div>
                          <Label htmlFor="flightTicket">Flight Ticket</Label>
                          <Input id="flightTicket" name="flightTicket" placeholder="e.g. Covered, One-way..." />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input id="country" name="country" placeholder="South Korea" required />
                        </div>
                        <div>
                          <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                          <Input
                            id="fieldOfStudy"
                            name="fieldOfStudy"
                            placeholder="Computer Science, Engineering"
                            required
                          />
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
                          const data: any = {
                            title: fd.get("title") as string,
                            provider: fd.get("provider") as string,
                            country: fd.get("country") as string,
                            // description: fd.get("description") as string, // Removed
                            // value: fd.get("value") as string, // Removed
                            level: (fd.get("level") as string),
                            fieldOfStudy: fd.get("fieldOfStudy") as string,
                            type: (fd.get("type") as string),
                            status: (fd.get("status") as string),
                            tuitionWaiver: fd.get("tuitionWaiver") as string,
                            monthlyStipend: fd.get("monthlyStipend") as string,
                            applicationFee: fd.get("applicationFee") as string,
                            flightTicket: fd.get("flightTicket") as string,
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
                        {/* Removed Value and Description Inputs */}

                        {/* Financial Support Section */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-tuitionWaiver">Tuition Waiver</Label>
                            <Input id="edit-tuitionWaiver" name="tuitionWaiver" defaultValue={editingScholarship.tuitionWaiver} placeholder="e.g. 100%" />
                          </div>
                          <div>
                            <Label htmlFor="edit-monthlyStipend">Monthly Stipend</Label>
                            <Input id="edit-monthlyStipend" name="monthlyStipend" defaultValue={editingScholarship.monthlyStipend} placeholder="e.g. $1000" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-applicationFee">Application Fee</Label>
                            <Input id="edit-applicationFee" name="applicationFee" defaultValue={editingScholarship.applicationFee} placeholder="Waived" />
                          </div>
                          <div>
                            <Label htmlFor="edit-flightTicket">Flight Ticket</Label>
                            <Input id="edit-flightTicket" name="flightTicket" defaultValue={editingScholarship.flightTicket} placeholder="Covered" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-country">Country *</Label>
                            <Input
                              id="edit-country"
                              name="country"
                              defaultValue={editingScholarship.country}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-fieldOfStudy">Field of Study *</Label>
                            <Input
                              id="edit-fieldOfStudy"
                              name="fieldOfStudy"
                              defaultValue={editingScholarship.fieldOfStudy}
                              required
                            />
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2 mb-6" />
                        <div className="space-y-3">
                          <div className="h-4 bg-muted rounded w-2/3" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {scholarships.map((s: any) => (
                    <Card
                      key={s.id}
                      className="group hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => navigate(`/scholarships/${s.id}`)}
                    >
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={getStatusBadge(s.status)}>{s.status}</Badge>
                          {s.featured ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              Featured
                            </Badge>
                          ) : null}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                            {s.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{s.provider}</p>
                        </div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{s.country || "Country not specified"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              {s.tuitionWaiver ||
                                s.monthlyStipend ||
                                s.duration ||
                                "See details"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              Deadline: {formatDate(s.applicationDeadLine ?? s.deadline)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span>Applicants</span>
                            <span className="font-medium text-foreground">
                              {s._count?.applications || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingScholarship(s);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScholarship(s.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
