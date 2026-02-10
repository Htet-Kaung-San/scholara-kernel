import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import {
  Users,
  GraduationCap,
  FileText,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Search,
  Filter,
  Download,
  Mail,
  Bell,
  Shield,
  DollarSign
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router";

const mockUsers = [
  { id: 1, name: "John Smith", email: "john@email.com", role: "Student", status: "Active", joinDate: "2024-01-15", applications: 3 },
  { id: 2, name: "Sarah Johnson", email: "sarah@email.com", role: "Student", status: "Active", joinDate: "2024-02-10", applications: 2 },
  { id: 3, name: "Mike Chen", email: "mike@email.com", role: "Admin", status: "Active", joinDate: "2023-12-01", applications: 0 },
  { id: 4, name: "Emma Wilson", email: "emma@email.com", role: "Student", status: "Suspended", joinDate: "2024-03-05", applications: 1 },
];

const mockScholarships = [
  { id: 1, title: "Global Korea Scholarship", provider: "Korean Government", status: "Active", applicants: 245, deadline: "2024-05-15", value: "$50,000" },
  { id: 2, title: "DAAD German Exchange", provider: "German Government", status: "Active", applicants: 189, deadline: "2024-06-30", value: "$35,000" },
  { id: 3, title: "Chevening UK", provider: "UK Government", status: "Closed", applicants: 156, deadline: "2024-03-15", value: "$45,000" },
  { id: 4, title: "Fulbright USA", provider: "US Government", status: "Draft", applicants: 0, deadline: "2024-08-01", value: "$60,000" },
];

const mockApplications = [
  { id: 1, student: "John Smith", scholarship: "Global Korea Scholarship", status: "Under Review", submittedDate: "2024-03-20", score: 85 },
  { id: 2, student: "Sarah Johnson", scholarship: "DAAD German Exchange", status: "Approved", submittedDate: "2024-03-18", score: 92 },
  { id: 3, student: "Emma Wilson", scholarship: "Chevening UK", status: "Rejected", submittedDate: "2024-03-15", score: 68 },
  { id: 4, student: "David Lee", scholarship: "Global Korea Scholarship", status: "Pending Documents", submittedDate: "2024-03-22", score: 78 },
];

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "suspended":
    case "rejected":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    case "closed":
    case "under review":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "draft":
    case "pending documents":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
  }
};

export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateScholarshipOpen, setIsCreateScholarshipOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="flex items-center gap-2">
                  <Shield className="h-6 w-6" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage users, scholarships, and platform settings
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Super Admin
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="scholarships" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Scholarships
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +20.1%
                    </span>
                    from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Scholarships</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +2 new
                    </span>
                    this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">142</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Needs attention
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.4M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +15.2%
                    </span>
                    from last year
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
                    {mockApplications.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{app.student}</p>
                          <p className="text-sm text-muted-foreground">{app.scholarship}</p>
                        </div>
                        <Badge className={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                      </div>
                    ))}
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Gateway</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3>User Management</h3>
                <p className="text-muted-foreground">Manage platform users and their permissions</p>
              </div>
              <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>Add a new user to the platform</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Smith" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super-admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsCreateUserOpen(false)}>
                        Create User
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
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
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
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
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.applications}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3>Scholarship Management</h3>
                <p className="text-muted-foreground">Create and manage scholarship opportunities</p>
              </div>
              <Dialog open={isCreateScholarshipOpen} onOpenChange={setIsCreateScholarshipOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scholarship
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Scholarship</DialogTitle>
                    <DialogDescription>Add a new scholarship opportunity</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="title">Scholarship Title</Label>
                      <Input id="title" placeholder="Global Korea Scholarship" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="provider">Provider</Label>
                        <Input id="provider" placeholder="Korean Government" />
                      </div>
                      <div>
                        <Label htmlFor="value">Value</Label>
                        <Input id="value" placeholder="$50,000" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Full scholarship for international students..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Application Deadline</Label>
                        <Input id="deadline" type="date" />
                      </div>
                      <div>
                        <Label htmlFor="level">Education Level</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="graduate">Graduate</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateScholarshipOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setIsCreateScholarshipOpen(false)}>
                        Create Scholarship
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Scholarships Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Scholarship</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockScholarships.map((scholarship) => (
                      <TableRow key={scholarship.id}>
                        <TableCell>
                          <p className="font-medium">{scholarship.title}</p>
                        </TableCell>
                        <TableCell>{scholarship.provider}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(scholarship.status)}>
                            {scholarship.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{scholarship.applicants}</TableCell>
                        <TableCell>{scholarship.deadline}</TableCell>
                        <TableCell>{scholarship.value}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3>Application Management</h3>
                <p className="text-muted-foreground">Review and manage scholarship applications</p>
              </div>
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

            {/* Applications Table */}
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
                    {mockApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <p className="font-medium">{app.student}</p>
                        </TableCell>
                        <TableCell>{app.scholarship}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(app.status)}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{app.submittedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-blue-600 rounded-full"
                                style={{ width: `${app.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{app.score}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3>Analytics & Reports</h3>
                <p className="text-muted-foreground">Platform performance and user insights</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            {/* Analytics Cards */}
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
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h3>Platform Settings</h3>
              <p className="text-muted-foreground">Configure platform behavior and preferences</p>
            </div>

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
                      <p className="text-sm text-muted-foreground">Put platform in maintenance mode</p>
                    </div>
                    <Switch id="maintenance" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="registrations">Allow New Registrations</Label>
                      <p className="text-sm text-muted-foreground">Enable user account creation</p>
                    </div>
                    <Switch id="registrations" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send system notifications via email</p>
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
                      <p className="text-sm text-muted-foreground">Enforce two-factor authentication</p>
                    </div>
                    <Switch id="2fa" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sessions">Force Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                    </div>
                    <Switch id="sessions" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="logs">Enable Audit Logs</Label>
                      <p className="text-sm text-muted-foreground">Track all admin actions</p>
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
                    <Input id="admin-email" type="email" placeholder="admin@edulearn.com" />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}